import { NextRequest } from "next/server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

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

// Keep a singleton client instance
let client: Client | null = null;
let transport: StdioClientTransport | null = null;
let isConnected = false;

// Fake tool for getting weather
function getWeather(location: string): string {
  const weatherConditions = [
    "sunny",
    "partly cloudy",
    "cloudy",
    "rainy",
    "stormy",
    "snowy",
    "foggy",
  ];
  const temperatures = {
    "New York": { min: 40, max: 85 },
    "San Francisco": { min: 50, max: 75 },
    Chicago: { min: 30, max: 80 },
    Miami: { min: 65, max: 95 },
    Seattle: { min: 40, max: 75 },
    default: { min: 35, max: 85 },
  };

  // Get temperature range based on location or use default
  const tempRange =
    temperatures[location as keyof typeof temperatures] || temperatures.default;

  // Generate a random temperature within the range
  const temperature =
    Math.floor(Math.random() * (tempRange.max - tempRange.min + 1)) +
    tempRange.min;

  // Select a random weather condition
  const condition =
    weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

  return `The current weather in ${location} is ${condition} with a temperature of ${temperature}°F.`;
}

// Initialize and get the MCP client
async function getClient(): Promise<Client> {
  if (client && isConnected) {
    return client;
  }

  try {
    client = new Client(
      {
        name: "content-creator-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    transport = new StdioClientTransport({
      command: "node",
      args: ["../server/dist/index.js"],
    });

    await client.connect(transport);
    isConnected = true;

    return client;
  } catch (error) {
    console.error("Error connecting to MCP server:", error);
    isConnected = false;
    throw new Error(`Failed to connect to MCP server: ${error}`);
  }
}

// Function to stream content to the client
export async function POST(req: NextRequest) {
  try {
    // Read request body once
    const reqBody = await req.json();
    const { messages, promptName, promptArgs, tool, resources = [] } = reqBody;

    // Handle tool calls
    if (tool === "weather") {
      const location = promptArgs?.location || "default";
      const weatherInfo = getWeather(location);

      // Stream the weather information
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const chunks = weatherInfo.split(" ");

          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(chunk + " "));
            await new Promise((resolve) => setTimeout(resolve, 50));
          }

          controller.close();
        },
      });

      return new StreamingTextResponse(stream);
    }

    // If we have a specific prompt name, use that
    if (promptName) {
      const mcpClient = await getClient();
      const result = await mcpClient.getPrompt({
        name: promptName,
        arguments: promptArgs || {},
      });

      // Extract the user message from the prompt
      let promptText = "No prompt content found";

      if (result.messages && result.messages.length > 0) {
        const userMessage = result.messages.find((msg) => msg.role === "user");
        if (
          userMessage &&
          userMessage.content &&
          typeof userMessage.content === "object" &&
          "type" in userMessage.content &&
          userMessage.content.type === "text" &&
          "text" in userMessage.content
        ) {
          promptText = userMessage.content.text || "";
        }
      }

      // Simulate streaming with a simple text encoder
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          // Split the text into chunks for more realistic streaming
          const chunks = promptText.split(" ");

          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(chunk + " "));
            // Add a small delay for more realistic streaming
            await new Promise((resolve) => setTimeout(resolve, 20));
          }

          controller.close();
        },
      });

      return new StreamingTextResponse(stream);
    }
    // For regular chat messages
    else if (messages && messages.length > 0) {
      // Get the last user message
      const lastMessage = messages[messages.length - 1];

      // Generate a meaningful response based on the message content
      let responseText = "";

      if (
        lastMessage.content.toLowerCase().includes("hello") ||
        lastMessage.content.toLowerCase().includes("hi")
      ) {
        responseText = "Hello! How can I help you today?";
      } else if (lastMessage.content.toLowerCase().includes("help")) {
        responseText =
          "I'm here to help! You can use commands like /content-idea or /weather, or mention resources with @. What would you like assistance with?";
      } else if (resources && resources.length > 0) {
        // If there are resources, generate a response about them
        responseText = `I see you've referenced some resources. Let me analyze those for you. Here's what I found:\n\n${resources
          .map(
            (r: { name: string; content: string }) =>
              `Based on "${r.name}", I can tell you that ${r.content.substring(
                0,
                100
              )}...`
          )
          .join("\n\n")}`;
      } else {
        // Generate a more intelligent response based on content
        const topics = [
          "writing",
          "content",
          "blog",
          "post",
          "article",
          "social",
          "media",
          "marketing",
          "seo",
          "headline",
        ];

        const foundTopics = topics.filter((topic) =>
          lastMessage.content.toLowerCase().includes(topic)
        );

        if (foundTopics.length > 0) {
          responseText = `I see you're interested in ${foundTopics.join(
            ", "
          )}. I can help you create better content with our specialized tools. Try using /content-idea or /headline-generator for more targeted assistance!`;
        } else {
          // Fallback to a more generic helpful response
          responseText = `I understand you're looking for help with "${lastMessage.content}". I can assist with content creation, rewriting, and generating ideas. What specific aspect would you like help with?`;
        }
      }

      // Simulate streaming with a simple text encoder
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          // Split the text into chunks for more realistic streaming
          const chunks = responseText.split(" ");

          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(chunk + " "));
            // Add a small delay for more realistic streaming
            await new Promise((resolve) => setTimeout(resolve, 20));
          }

          controller.close();
        },
      });

      return new StreamingTextResponse(stream);
    }

    return new Response("No valid input provided", { status: 400 });
  } catch (error) {
    console.error("Error in AI API route:", error);
    return new Response(`Error: ${error}`, { status: 500 });
  }
}
