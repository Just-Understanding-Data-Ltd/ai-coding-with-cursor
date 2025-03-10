"use client";

import React, { useState, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import ReactMarkdown from "react-markdown";
import { Send, X, Cloud } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import {
  connect,
  disconnect,
  getPrompts,
  getResources,
  executePrompt,
  getResourceContent,
} from "../app/actions";
import {
  ChatMessage,
  ResourceReference,
  Prompt,
  Resource,
  ToolInvocation,
} from "../app/types";
import { ContentExpander } from "./ContentExpander";
import { ChatToolInvocation } from "./ChatToolInvocation";

// Custom Label component
const Label = ({
  htmlFor,
  className,
  children,
}: {
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium ${className || ""}`}>
    {children}
  </label>
);

// Custom Input component
const Input = ({
  id,
  placeholder,
  value,
  onChange,
  required,
  className,
}: {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
}) => (
  <input
    id={id}
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={`w-full p-2 border rounded-md ${className || ""}`}
  />
);

// Weather Tool Form component
const WeatherToolForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (location: string) => void;
  onCancel: () => void;
}) => {
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(location);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium text-lg">Weather Tool</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Get the current weather for a location
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="location" className="mb-1 block">
            Location <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            placeholder="Enter a city name (e.g., New York)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!location.trim()}>
            Get Weather
          </Button>
        </div>
      </form>
    </div>
  );
};

// Prompt form component
const PromptForm = ({
  prompt,
  onSubmit,
  onCancel,
}: {
  prompt: Prompt;
  onSubmit: (name: string, args: Record<string, string>) => void;
  onCancel: () => void;
}) => {
  const [args, setArgs] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setArgs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt.name, args);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-lg">{prompt.name}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-gray-500 mb-4">{prompt.description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {prompt.arguments.map((arg) => (
          <div key={arg.name}>
            <Label htmlFor={arg.name} className="mb-1 block">
              {arg.name}{" "}
              {arg.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={arg.name}
              placeholder={arg.description}
              value={args[arg.name] || ""}
              onChange={(e) => handleChange(arg.name, e.target.value)}
              required={arg.required}
              className="w-full"
            />
          </div>
        ))}

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Execute Prompt</Button>
        </div>
      </form>
    </div>
  );
};

export function Chat() {
  // AI SDK chat state with maxSteps for multi-step tool calls
  const {
    messages: aiMessages,
    append: appendAiMessage,
    setInput: setAiInput,
  } = useChat({
    api: "/api/ai",
    maxSteps: 5, // Allow up to 5 steps for tool calls
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isResourceOpen, setIsResourceOpen] = useState(false);
  const [showExpander, setShowExpander] = useState(false);
  const [expanderContent, setExpanderContent] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [showWeatherTool, setShowWeatherTool] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const connectToMCP = async () => {
      try {
        setIsConnecting(true);
        const connected = await connect();
        setIsConnected(connected);
        if (connected) {
          const resourcesList = await getResources();
          console.log("Resources loaded from server:", resourcesList);
          const promptsList = await getPrompts();
          setResources(resourcesList);
          setPrompts(promptsList);
        } else {
          setError("Failed to connect to MCP server");
        }
      } catch (error) {
        console.error("Connection error:", error);
        setError(`Error connecting to MCP server: ${error}`);
      } finally {
        setIsConnecting(false);
      }
    };

    connectToMCP();

    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sync AI messages with our UI
  useEffect(() => {
    if (aiMessages.length > 0) {
      // Convert AI SDK messages to our message format
      const newMessages: ChatMessage[] = aiMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        isLoading: false,
        toolInvocations: msg.toolInvocations as ToolInvocation[] | undefined,
      }));

      setMessages(newMessages);
    }
  }, [aiMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setAiInput(value); // Update the AI SDK input as well

    // Extract search term after / or @
    let newSearchTerm = "";
    if (value.includes("/")) {
      const parts = value.split("/");
      if (parts.length > 1) {
        newSearchTerm = parts[parts.length - 1].trim();
      }
    } else if (value.includes("@")) {
      const parts = value.split("@");
      if (parts.length > 1) {
        newSearchTerm = parts[parts.length - 1].trim();

        // Auto-replace full resource names when typed manually
        const lastPartText = parts[parts.length - 1].trim();
        const matchingResource = resources.find(
          (resource) =>
            resource.name.toLowerCase() === lastPartText.toLowerCase()
        );

        if (matchingResource && textareaRef.current) {
          // If a full resource name is typed after @, replace it properly
          const lastAtIndex = value.lastIndexOf("@");
          if (lastAtIndex !== -1) {
            const newValue =
              value.substring(0, lastAtIndex + 1) + matchingResource.name + " ";

            // We need to do this outside the current event handler to avoid React state conflicts
            setTimeout(() => {
              setInputValue(newValue);
              if (textareaRef.current) {
                textareaRef.current.value = newValue;
                textareaRef.current.selectionStart = newValue.length;
                textareaRef.current.selectionEnd = newValue.length;
              }
            }, 0);
          }
        }
      }
    }
    setSearchTerm(newSearchTerm);

    // Open command menu on "/"
    if (value.endsWith("/") && !isCommandOpen) {
      setIsCommandOpen(true);
      setIsResourceOpen(false);
      setSearchTerm("");
    }

    // Open resource command bar on "@"
    if (value.endsWith("@") && !isResourceOpen) {
      setIsResourceOpen(true);
      setIsCommandOpen(false);
      setSearchTerm("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }

    // Escape to close command menu
    if (e.key === "Escape") {
      setIsCommandOpen(false);
      setIsResourceOpen(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isConnected) return;

    // Handle special commands first
    if (inputValue.startsWith("/expand")) {
      // Extract content after /expand
      const content = inputValue.replace("/expand", "").trim();
      if (content) {
        setExpanderContent(content);
        setShowExpander(true);
        setInputValue("");
        setAiInput("");
        return;
      }
    }

    // Handle weather tool command
    if (inputValue.startsWith("/weather")) {
      setShowWeatherTool(true);
      setInputValue("");
      setAiInput("");
      return;
    }

    // Check for resource references (@resource)
    // First, find all complete resource references
    const resourceReferences: string[] = [];

    // Log available resources for debugging
    console.log("Available resources in UI:", resources);

    if (resources.length === 0) {
      console.warn(
        "No resources available in the UI. Resource references will not work."
      );
    }

    // Try to match each resource name exactly
    for (const resource of resources) {
      try {
        // Escape special characters in resource name for regex safety
        const escapedName = resource.name.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        const resourcePattern = new RegExp(`@${escapedName}\\b`, "g");
        const matches = [...inputValue.matchAll(resourcePattern)];

        if (matches.length > 0) {
          console.log(
            `Found match for resource: ${resource.name} with URI: ${resource.uri}`
          );
          resourceReferences.push(`@${resource.name}`);
        }
      } catch (error) {
        console.error(`Error matching resource ${resource.name}:`, error);
      }
    }

    console.log("Detected resource references:", resourceReferences);

    // If we found resources, handle them
    if (resourceReferences.length > 0) {
      // Add user message
      const userMsg = {
        id: nanoid(),
        role: "user" as const,
        content: inputValue,
      };

      setMessages([...messages, userMsg]);
      setInputValue("");
      setAiInput("");

      // Add assistant "thinking" message
      const assistantMessageId = nanoid();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "Processing your request...",
          isLoading: true,
        },
      ]);

      try {
        const fetchedRefs: ResourceReference[] = [];

        // Get fresh resources to ensure we have the latest
        try {
          console.log("Refreshing resources before processing references...");
          const freshResources = await getResources();
          if (freshResources.length > 0) {
            console.log("Got fresh resources:", freshResources);
            setResources(freshResources);
          } else {
            console.warn("Refresh returned empty resources");
          }
        } catch (refreshError) {
          console.error("Error refreshing resources:", refreshError);
        }

        for (const ref of resourceReferences) {
          // Remove the @ symbol and find the matching resource
          const resourceName = ref.substring(1);
          console.log(`Looking for resource with name: "${resourceName}"`);

          const matchingResource = resources.find(
            (r) => r.name === resourceName
          );

          if (matchingResource) {
            console.log(`Found matching resource: ${matchingResource.uri}`);
            try {
              const resource = await getResourceContent(matchingResource.uri);
              if (resource) {
                console.log(
                  `Successfully fetched resource content for: ${matchingResource.name}`
                );
                fetchedRefs.push(resource);
              } else {
                console.error(
                  `Failed to get content for resource: ${matchingResource.name}`
                );
              }
            } catch (resourceError) {
              console.error(`Error fetching resource: ${resourceError}`);
            }
          } else {
            console.error(
              `No matching resource found for name: ${resourceName}`
            );
          }
        }

        if (fetchedRefs.length > 0) {
          // Send the content to the AI API with the fetched resources
          fetch("/api/ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [userMsg],
              resources: fetchedRefs,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              // Process the streaming response
              const reader = response.body?.getReader();
              const decoder = new TextDecoder();
              let receivedText = "";

              if (!reader) {
                throw new Error("Response body is not readable");
              }

              // Update the assistant message to processing state
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: "Processing...",
                        isLoading: true,
                      }
                    : msg
                )
              );

              // Function to read the stream chunks
              const readChunk = () => {
                reader
                  .read()
                  .then(({ done, value }) => {
                    if (done) {
                      // Streaming complete, update the final message
                      setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                          msg.id === assistantMessageId
                            ? {
                                ...msg,
                                content: receivedText,
                                isLoading: false,
                              }
                            : msg
                        )
                      );
                      return;
                    }

                    // Decode the chunk and add to our text
                    const chunkText = decoder.decode(value, { stream: true });
                    receivedText += chunkText;

                    // Update the message with the current received text
                    setMessages((prevMessages) =>
                      prevMessages.map((msg) =>
                        msg.id === assistantMessageId
                          ? {
                              ...msg,
                              content: receivedText,
                              isLoading: true,
                            }
                          : msg
                      )
                    );

                    // Continue reading
                    readChunk();
                  })
                  .catch((error) => {
                    console.error("Error reading stream:", error);
                    setMessages((prevMessages) =>
                      prevMessages.map((msg) =>
                        msg.id === assistantMessageId
                          ? {
                              ...msg,
                              content: `Error processing stream: ${error}`,
                              isLoading: false,
                            }
                          : msg
                      )
                    );
                  });
              };

              // Start reading the stream
              readChunk();
            })
            .catch((error) => {
              console.error("Error calling AI API:", error);
              // Update message with error
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: `Error processing request: ${error}`,
                        isLoading: false,
                      }
                    : msg
                )
              );
            });
        } else {
          // No resources found
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: "No resources found matching your references.",
                    isLoading: false,
                  }
                : msg
            )
          );
        }
      } catch (err) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `Error fetching resources: ${
                    err instanceof Error ? err.message : String(err)
                  }`,
                  isLoading: false,
                }
              : msg
          )
        );
      }
      return;
    }

    // Check for prompt commands (/promptname)
    const promptMatch: RegExpMatchArray | null =
      inputValue.match(/^\/(\S+)(.*)$/);
    if (promptMatch) {
      const promptName = promptMatch[1];
      const promptArgs = promptMatch[2].trim();

      // Parse arguments (simple space-separated key=value pairs)
      const args: Record<string, string> = {};
      if (promptArgs) {
        const argPairs = promptArgs.split(" ");
        for (const pair of argPairs) {
          const [key, value] = pair.split("=");
          if (key && value) {
            args[key.trim()] = value.trim();
          }
        }
      }

      // Add user message
      const userMsg = {
        id: nanoid(),
        role: "user" as const,
        content: inputValue,
      };

      // Use AI SDK to stream the response
      appendAiMessage(userMsg);
      setInputValue("");
      setAiInput("");

      // Call our API endpoint with the prompt info
      fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [userMsg],
          promptName: promptName,
          promptArgs: args,
        }),
      }).catch((error) => {
        console.error("Error calling AI API:", error);
      });

      return;
    }

    // For regular messages, implement our own streaming
    // Add user message
    const userMsgId = nanoid();
    const userMsg = {
      id: userMsgId,
      role: "user" as const,
      content: inputValue,
    };

    setMessages([...messages, userMsg]);

    // Add assistant "thinking" message
    const assistantMessageId = nanoid();
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "Thinking...",
        isLoading: true,
      },
    ]);

    // Call the API with streaming
    fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [userMsg],
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Process the streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let receivedText = "";

        if (!reader) {
          throw new Error("Response body is not readable");
        }

        // Function to read the stream chunks
        const readChunk = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                // Streaming complete, update the final message
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: receivedText,
                          isLoading: false,
                        }
                      : msg
                  )
                );
                return;
              }

              // Decode the chunk and add to our text
              const chunkText = decoder.decode(value, { stream: true });
              receivedText += chunkText;

              // Update the message with the current received text
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: receivedText,
                        isLoading: true,
                      }
                    : msg
                )
              );

              // Continue reading
              readChunk();
            })
            .catch((error) => {
              console.error("Error reading stream:", error);
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: `Error processing stream: ${error}`,
                        isLoading: false,
                      }
                    : msg
                )
              );
            });
        };

        // Start reading the stream
        readChunk();
      })
      .catch((error) => {
        console.error("Error calling AI API:", error);
        // Update message with error
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `Error processing request: ${error}`,
                  isLoading: false,
                }
              : msg
          )
        );
      });

    setInputValue("");
    setAiInput("");
  };

  const handleExpandContent = async (content: string, targetLength: string) => {
    if (!content.trim() || !isConnected) return;

    // Add user message
    const userMessageId = nanoid();
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: userMessageId,
        role: "user",
        content: `/content-expand content="${content}" target_length="${targetLength}"`,
      },
    ]);

    // Add assistant "thinking" message
    const assistantMessageId = nanoid();
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "Expanding content...",
        isLoading: true,
      },
    ]);

    try {
      const args = {
        content,
        target_length: targetLength,
      };

      // Execute the prompt using server action
      const response = await executePrompt("content-expand", args);

      // Update the assistant message
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: response,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error expanding content:", error);

      // Update the assistant message with the error
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Error expanding content: ${error}`,
                isLoading: false,
              }
            : msg
        )
      );
    }
  };

  const handleCommandSelect = (value: string) => {
    setIsCommandOpen(false);

    // Special case for weather tool
    if (value === "weather") {
      setShowWeatherTool(true);
      setInputValue("");
      return;
    }

    // Find the selected prompt
    const selectedPrompt = prompts.find((p) => p.name === value);

    if (selectedPrompt) {
      // Set the selected prompt as active to show its form
      setActivePrompt(selectedPrompt);
      // Clear the input value since we're showing a form instead
      setInputValue("");
    }
  };

  // Update handlePromptSubmit function to use streaming
  const handlePromptSubmit = async (
    name: string,
    args: Record<string, string>
  ) => {
    // Clear the active prompt form
    setActivePrompt(null);

    // Create the command message
    let commandText = `/${name}`;

    // Add arguments to the command text
    Object.entries(args).forEach(([key, value]) => {
      if (value) {
        commandText += ` ${key}="${value}"`;
      }
    });

    // Create message for AI SDK
    const userMsg = {
      id: nanoid(),
      role: "user" as const,
      content: commandText,
    };

    // Use AI SDK to stream the response
    appendAiMessage(userMsg);

    // Call our API endpoint with the prompt info
    fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [userMsg],
        promptName: name,
        promptArgs: args,
      }),
    }).catch((error) => {
      console.error("Error calling AI API:", error);
    });
  };

  // Function to cancel the prompt form
  const handlePromptCancel = () => {
    setActivePrompt(null);
  };

  // Handle weather tool submission
  const handleWeatherToolSubmit = (location: string) => {
    setShowWeatherTool(false);

    // Create message for AI SDK
    const userMsg = {
      id: nanoid(),
      role: "user" as const,
      content: `What's the weather in ${location}?`,
    };

    // Use AI SDK to stream the response
    appendAiMessage(userMsg);

    // Call our API endpoint with the weather tool request
    fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [userMsg],
        tool: "weather",
        promptArgs: { location },
      }),
    }).catch((error) => {
      console.error("Error calling AI API:", error);
    });
  };

  // Function to cancel the weather tool form
  const handleWeatherToolCancel = () => {
    setShowWeatherTool(false);
  };

  const handleResourceSelect = (value: string) => {
    setIsResourceOpen(false);

    // Find the resource by URI to get its name
    const selectedResource = resources.find((r: Resource) => r.uri === value);

    // Set input to the selected resource name (not URI)
    if (textareaRef.current && selectedResource) {
      const currentValue = textareaRef.current.value;
      const lastAtIndex = currentValue.lastIndexOf("@");

      if (lastAtIndex !== -1) {
        // Replace everything after the last @ with the selected resource name
        const newValue =
          currentValue.substring(0, lastAtIndex + 1) +
          selectedResource.name +
          " ";
        setInputValue(newValue);

        // Focus the textarea and move cursor to the end
        textareaRef.current.focus();
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = newValue.length;
            textareaRef.current.selectionEnd = newValue.length;
          }
        }, 0);
      }
    }
  };

  const filteredPrompts = prompts.filter((prompt) => {
    if (!searchTerm) return true;
    return (
      prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Add weather to available commands
  const availableCommands = [
    { name: "weather", description: "Get the current weather for a location" },
    ...filteredPrompts,
  ];

  const filteredResources = resources.filter((resource) => {
    if (!searchTerm) return true;
    return (
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      resource.uri.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExpanderDone = (targetLength: string) => {
    setShowExpander(false);

    if (targetLength) {
      handleExpandContent(expanderContent, targetLength);
    }
  };

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-lg font-medium mb-2">Connecting to MCP server...</p>
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-lg font-medium text-red-500 mb-2">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-lg font-medium text-red-500 mb-2">
          Failed to connect to MCP server
        </p>
        <Button onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[800px]">
      {/* Content expander dialog */}
      {showExpander && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full">
            <ContentExpander
              initialContent={expanderContent}
              onDone={handleExpanderDone}
            />
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Show weather tool form if selected */}
        {showWeatherTool && (
          <WeatherToolForm
            onSubmit={handleWeatherToolSubmit}
            onCancel={handleWeatherToolCancel}
          />
        )}

        {/* Show active prompt form if selected */}
        {activePrompt && (
          <PromptForm
            prompt={activePrompt}
            onSubmit={handlePromptSubmit}
            onCancel={handlePromptCancel}
          />
        )}

        {/* Show messages only if no form is active */}
        {!activePrompt && !showWeatherTool && (
          <>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <p className="text-lg font-medium mb-2">
                  Welcome to DevAssist!
                </p>
                <p className="max-w-md">
                  Type a message or use commands like /content-expand to work
                  with your content. Try the new /weather command to check the
                  weather!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Message content */}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <div>{message.content}</div>
                        <div className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent"></div>
                      </div>
                    ) : (
                      <div>
                        {/* Show tool invocations if present */}
                        {message.toolInvocations &&
                          message.toolInvocations.length > 0 && (
                            <div className="mb-3">
                              {message.toolInvocations.map((toolInvocation) => (
                                <ChatToolInvocation
                                  key={toolInvocation.id}
                                  toolInvocation={toolInvocation}
                                />
                              ))}
                            </div>
                          )}

                        <div className="prose dark:prose-invert max-w-none break-words">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        {message.resourceReferences && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            {message.resourceReferences.map((ref) => (
                              <div key={ref.uri} className="text-sm">
                                <div className="font-medium">{ref.name}</div>
                                <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto mt-1">
                                  {ref.content.length > 300
                                    ? `${ref.content.substring(0, 300)}...`
                                    : ref.content}
                                </pre>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Command dialog for prompts */}
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput
          placeholder="Search available commands..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          className="text-base font-medium !text-foreground"
        />
        <CommandList className="font-sans">
          <CommandEmpty>No commands found.</CommandEmpty>
          <CommandGroup
            heading="Available Commands"
            className="font-medium text-base"
          >
            {availableCommands.map((command) => (
              <CommandItem
                key={command.name}
                value={command.name}
                onSelect={handleCommandSelect}
                className="text-base font-normal !text-foreground antialiased"
                style={{
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale",
                  textRendering: "optimizeLegibility",
                }}
              >
                <div className="w-full">
                  <div className="font-medium text-foreground not-italic">
                    {command.name}
                  </div>
                  <div className="text-xs text-muted-foreground not-italic antialiased">
                    {command.description}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Resource selection popover */}
      <Popover open={isResourceOpen} onOpenChange={setIsResourceOpen}>
        <PopoverTrigger asChild>
          <Button className="hidden">Resources</Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[300px] p-0"
          align="end"
          side="top"
          sideOffset={10}
        >
          <Command>
            <CommandInput
              placeholder="Search resources..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="text-base font-medium !text-foreground"
            />
            <CommandList className="font-sans">
              <CommandEmpty>No resources found.</CommandEmpty>
              <CommandGroup
                heading="Available Resources"
                className="font-medium text-base"
              >
                {filteredResources.map((resource) => (
                  <CommandItem
                    key={resource.uri}
                    value={resource.uri}
                    onSelect={handleResourceSelect}
                    className="text-base font-normal !text-foreground antialiased"
                    style={{
                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                      textRendering: "optimizeLegibility",
                    }}
                  >
                    <div className="w-full">
                      <div className="font-medium text-foreground not-italic">
                        {resource.name}
                      </div>
                      <div className="text-xs text-muted-foreground not-italic antialiased">
                        {resource.description || resource.uri}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Input Area */}
      <div className="border-t p-4">
        {!activePrompt && !showWeatherTool && (
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message, use / for commands or @ for resources..."
              className="flex-1 min-h-[80px] max-h-[160px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !isConnected}
              size="icon"
              className="h-10 w-10"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        )}

        {!activePrompt && !showWeatherTool && (
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-medium">Tips:</span> Type &quot;/&quot; to see
            available prompts, &quot;@&quot; to reference resources,
            &quot;/expand&quot; to expand content, or try the new
            &quot;/weather&quot; command!
          </div>
        )}
      </div>
    </div>
  );
}
