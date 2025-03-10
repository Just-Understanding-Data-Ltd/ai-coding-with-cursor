import { NextRequest } from "next/server";
import OpenAI from "openai";
import { MCPClient } from "@/lib/mcp-client";

// Define types for chat messages
type Role = "system" | "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
}

// Custom implementation of StreamingTextResponse since the ai package might have issues
class StreamingTextResponse extends Response {
  constructor(stream: ReadableStream) {
    super(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to stream content to the client
export async function POST(req: NextRequest) {
  try {
    // Read request body once
    const reqBody = await req.json();
    const { messages, promptName, promptArgs, tool, resources = [] } = reqBody;

    // Handle tool calls through MCP
    if (tool) {
      try {
        console.log(
          `Executing tool via MCP: ${tool} with args:`,
          promptArgs || {}
        );

        // Get MCPClient instance
        const mcpClient = MCPClient.getInstance();

        // Ensure client is connected
        await mcpClient.connect();

        // Execute the tool using our MCPClient wrapper
        const result = await mcpClient.executeTool(tool, promptArgs || {});
        console.log(`Tool execution result:`, result);

        // Extract response from MCP tool execution
        let toolResponse = "Tool execution failed or returned no content";

        // Process the result based on its structure
        if (result) {
          if (result.content && Array.isArray(result.content)) {
            // Handle content array from MCP tool call
            const textContent = result.content
              .filter((item: { type: string }) => item.type === "text")
              .map((item: { text: string }) => item.text)
              .join("\n");

            if (textContent) {
              toolResponse = textContent;
            }
          } else if (result.toolResult) {
            // Handle toolResult format
            if (typeof result.toolResult === "string") {
              toolResponse = result.toolResult;
            } else {
              toolResponse = JSON.stringify(result.toolResult, null, 2);
            }
          }
        }

        console.log(`Final tool response:`, toolResponse);

        // Stream the tool response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            // For better user experience, stream word by word
            const chunks = toolResponse.split(" ");

            for (const chunk of chunks) {
              controller.enqueue(encoder.encode(chunk + " "));
              await new Promise((resolve) => setTimeout(resolve, 20)); // Slightly faster pace
            }

            controller.close();
          },
        });

        return new StreamingTextResponse(stream);
      } catch (error) {
        console.error(`Error executing tool ${tool}:`, error);

        // Return error as stream
        const encoder = new TextEncoder();
        const errorMsg = `Error executing tool ${tool}: ${
          error instanceof Error ? error.message : String(error)
        }`;

        const stream = new ReadableStream({
          async start(controller) {
            controller.enqueue(encoder.encode(errorMsg));
            controller.close();
          },
        });

        return new StreamingTextResponse(stream);
      }
    }

    // If we have a specific prompt name, use that
    if (promptName) {
      try {
        // Get MCPClient instance
        const mcpClient = MCPClient.getInstance();

        // Ensure client is connected
        await mcpClient.connect();

        // Get the prompt result through our MCPClient wrapper
        const promptResult = await mcpClient.executePrompt(
          promptName,
          promptArgs || {}
        );
        console.log(`Got MCP prompt result for ${promptName}:`, promptResult);

        // Create a proper system message
        const systemMessage = {
          role: "system" as Role,
          content: `You are a helpful assistant. Use the following information from the '${promptName}' prompt to assist the user: ${promptResult}`,
        };

        // Add the user message for context if available
        const promptMessages = [systemMessage];
        if (messages && messages.length > 0) {
          const userMessage = messages[messages.length - 1];
          promptMessages.push({
            role: "user" as Role,
            content: userMessage.content,
          });
        } else {
          // If no user message provided, add a generic one
          promptMessages.push({
            role: "user" as Role,
            content: `Please help me with information from the ${promptName} prompt.`,
          });
        }

        // Make the OpenAI API call with streaming
        const stream = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Using a more capable model for better results
          messages: promptMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 800,
        });

        // Handle streaming from OpenAI's API
        const readableStream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            // Process each chunk as it arrives
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();
          },
        });

        // Return the streaming response
        return new StreamingTextResponse(readableStream);
      } catch (error) {
        console.error("Error processing prompt:", error);

        // Fallback error handling
        const encoder = new TextEncoder();
        const errorMessage = `Error processing prompt: ${
          error instanceof Error ? error.message : String(error)
        }`;
        const stream = new ReadableStream({
          async start(controller) {
            controller.enqueue(encoder.encode(errorMessage));
            controller.close();
          },
        });

        return new StreamingTextResponse(stream);
      }
    }
    // For regular chat messages
    else if (messages && messages.length > 0) {
      // Create a system message for guidance
      const systemMessage = {
        role: "system",
        content:
          "You are a helpful AI assistant specializing in content creation and marketing. Help the user with their questions, resource analysis, and content needs. Be concise, helpful and professional.",
      };

      // Prepare messages for OpenAI
      let openaiMessages = [systemMessage];

      // Add all messages from conversation history
      const conversationMessages = messages.map(
        (msg: { role: string; content: string }) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        })
      ) as ChatMessage[];

      openaiMessages = [...openaiMessages, ...conversationMessages];

      // Add context about resources if any are referenced
      if (resources && resources.length > 0) {
        const resourcesContext = {
          role: "system" as const,
          content: `The user has referenced the following resources in their latest message: ${resources
            .map(
              (r: { name: string; content: string }) =>
                `${r.name}: ${r.content.substring(0, 200)}...`
            )
            .join(
              "\n\n"
            )}\n\nPlease analyze these resources and provide insights.`,
        };
        openaiMessages.push(resourcesContext);
      }

      try {
        // Make the OpenAI API call with streaming
        const stream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: openaiMessages as ChatMessage[], // Type assertion to satisfy TypeScript
          stream: true,
          temperature: 0.7,
          max_tokens: 800,
        });

        // Create a TransformStream to handle the chunks
        const encoder = new TextEncoder();

        // Handle streaming from OpenAI's API
        const readableStream = new ReadableStream({
          async start(controller) {
            // Process each chunk as it arrives
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();
          },
        });

        // Return the streaming response
        return new StreamingTextResponse(readableStream);
      } catch (error: unknown) {
        console.error("Error calling OpenAI:", error);

        // Fallback in case of API errors
        let responseText =
          "I'm sorry, I encountered an error processing your request. Please try again.";

        // Check if it's an API key or rate limit issue
        if (error instanceof Error) {
          const apiError = error as unknown as { status: number };
          if (apiError.status === 401) {
            responseText =
              "API key error: Please check your OpenAI API key configuration.";
          } else if (apiError.status === 429) {
            responseText =
              "Rate limit exceeded: The system is currently experiencing high demand. Please try again later.";
          }
        }

        // Stream the error message
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const chunks = responseText.split(" ");

            for (const chunk of chunks) {
              controller.enqueue(encoder.encode(chunk + " "));
              await new Promise((resolve) => setTimeout(resolve, 20));
            }

            controller.close();
          },
        });

        return new StreamingTextResponse(stream);
      }
    }

    return new Response("Invalid request", { status: 400 });
  } catch (error) {
    console.error("Error in AI API route:", error);
    return new Response(`Error: ${error}`, { status: 500 });
  }
}
