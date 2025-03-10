"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  refreshResources,
  refreshPrompts,
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
          try {
            // Directly refresh resources to ensure we get the latest
            const resourcesList = await refreshResources();
            console.log("Resources refreshed from server:", resourcesList);

            if (resourcesList && resourcesList.length > 0) {
              setResources(resourcesList);
            } else {
              console.warn(
                "No resources returned from server, adding mock resources for testing"
              );
              // Add mock resources for testing if no real resources are returned
              const mockResources = [
                {
                  uri: "content://blog-example",
                  name: "Blog Post Example",
                  description: "A sample blog post about productivity",
                  mimeType: "text/markdown",
                },
                {
                  uri: "content://social-post",
                  name: "Social Media Post",
                  description: "A LinkedIn post about leadership",
                  mimeType: "text/plain",
                },
                {
                  uri: "content://email-template",
                  name: "Email Template",
                  description: "A follow-up email template after a meeting",
                  mimeType: "text/plain",
                },
              ];
              setResources(mockResources);
            }

            // Refresh prompts and ensure we get the latest
            const promptsList = await refreshPrompts();
            console.log("Prompts refreshed from server:", promptsList);

            if (promptsList && promptsList.length > 0) {
              setPrompts(promptsList);
            } else {
              console.warn(
                "No prompts returned from server, adding mock prompts for testing"
              );
              // Add mock prompts for testing if no real prompts are returned
              const mockPrompts = [
                {
                  name: "content-idea",
                  description: "Generate content ideas for your topic",
                  arguments: [
                    {
                      name: "topic",
                      description: "The topic to generate ideas for",
                      required: true,
                    },
                  ],
                },
                {
                  name: "headline-generator",
                  description: "Create catchy headlines for your content",
                  arguments: [
                    {
                      name: "topic",
                      description: "The topic of your content",
                      required: true,
                    },
                    {
                      name: "tone",
                      description:
                        "The tone of the headlines (professional, casual, etc.)",
                      required: false,
                    },
                  ],
                },
                {
                  name: "rewrite-content",
                  description:
                    "Rewrite content to improve clarity and engagement",
                  arguments: [
                    {
                      name: "content",
                      description: "The content to rewrite",
                      required: true,
                    },
                    {
                      name: "tone",
                      description: "The desired tone",
                      required: false,
                    },
                  ],
                },
              ];
              setPrompts(mockPrompts);
            }
          } catch (error) {
            console.error("Error loading resources or prompts:", error);
            // Add mock data in case of error
            const mockResources = [
              {
                uri: "content://blog-example",
                name: "Blog Post Example",
                description: "A sample blog post about productivity",
                mimeType: "text/markdown",
              },
              {
                uri: "content://social-post",
                name: "Social Media Post",
                description: "A LinkedIn post about leadership",
                mimeType: "text/plain",
              },
              {
                uri: "content://email-template",
                name: "Email Template",
                description: "A follow-up email template after a meeting",
                mimeType: "text/plain",
              },
            ];
            setResources(mockResources);

            const mockPrompts = [
              {
                name: "content-idea",
                description: "Generate content ideas for your topic",
                arguments: [
                  {
                    name: "topic",
                    description: "The topic to generate ideas for",
                    required: true,
                  },
                ],
              },
              {
                name: "headline-generator",
                description: "Create catchy headlines for your content",
                arguments: [
                  {
                    name: "topic",
                    description: "The topic of your content",
                    required: true,
                  },
                  {
                    name: "tone",
                    description:
                      "The tone of the headlines (professional, casual, etc.)",
                    required: false,
                  },
                ],
              },
              {
                name: "rewrite-content",
                description:
                  "Rewrite content to improve clarity and engagement",
                arguments: [
                  {
                    name: "content",
                    description: "The content to rewrite",
                    required: true,
                  },
                  {
                    name: "tone",
                    description: "The desired tone",
                    required: false,
                  },
                ],
              },
            ];
            setPrompts(mockPrompts);
          }
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

    // Check for slash commands
    if (value.includes("/")) {
      // Check if the command is complete (followed by a space with no additional slashes)
      const matches = value.match(/\/([A-Za-z\-]+)\s/g);

      if (
        matches &&
        matches.length > 0 &&
        !value.includes("/", value.indexOf(matches[0]) + matches[0].length)
      ) {
        // If a complete command is found (with trailing space), close the command menu
        console.log("Complete command found:", matches);
        if (isCommandOpen) {
          setIsCommandOpen(false);
          setSearchTerm("");
        }
      } else {
        // Open or keep command menu open when a slash is present
        if (!isCommandOpen) {
          setIsCommandOpen(true);
          setIsResourceOpen(false);
        }

        // Extract search term after the last slash for filtering
        const lastSlashIndex = value.lastIndexOf("/");
        if (lastSlashIndex !== -1) {
          // When the user types exactly "/", we want to show all commands
          if (
            lastSlashIndex === value.length - 1 ||
            value.substring(lastSlashIndex + 1).trim() === ""
          ) {
            console.log("Setting empty search term for /");
            // Set empty search term to show all available commands immediately
            setSearchTerm("");
          } else {
            // Only filter when there's at least one character after the slash
            const afterSlash = value.substring(lastSlashIndex + 1).trim();
            console.log("Slash search term:", afterSlash);
            setSearchTerm(afterSlash);
          }
        }
      }
    }
    // Check for resource references
    else if (value.includes("@")) {
      // Check if the resource reference is complete (followed by a space)
      const matches = value.match(/@([A-Za-z\s]+)\s/g);

      if (matches && matches.length > 0) {
        // If a complete resource reference is found (with trailing space), close the resource menu
        console.log("Complete resource reference found:", matches);
        if (isResourceOpen) {
          setIsResourceOpen(false);
          setSearchTerm("");
        }
      } else {
        // Open or keep resource menu open when @ is present and no complete reference is found
        if (!isResourceOpen) {
          setIsResourceOpen(true);
          setIsCommandOpen(false);
        }

        // Extract search term after the last @ for filtering
        const lastAtIndex = value.lastIndexOf("@");
        if (lastAtIndex !== -1) {
          // When the user types exactly "@", we want to show all resources
          if (lastAtIndex === value.length - 1) {
            console.log("Setting empty search term for @");
            setSearchTerm("");
          } else {
            // Otherwise, use the text after @ as search term
            const afterAt = value.substring(lastAtIndex + 1).trim();
            console.log("@ search term:", afterAt);
            setSearchTerm(afterAt);

            // Auto-replace full resource names when typed manually
            const matchingResource = resources.find(
              (resource) =>
                resource.name.toLowerCase() === afterAt.toLowerCase()
            );

            if (matchingResource && textareaRef.current) {
              // If a full resource name is typed after @, replace it properly
              // We need to do this outside the current event handler to avoid React state conflicts
              setTimeout(() => {
                const newValue =
                  value.substring(0, lastAtIndex + 1) +
                  matchingResource.name +
                  " ";

                setInputValue(newValue);
                if (textareaRef.current) {
                  textareaRef.current.value = newValue;
                  textareaRef.current.selectionStart = newValue.length;
                  textareaRef.current.selectionEnd = newValue.length;
                }

                // Close the resource menu as we've completed the reference
                setIsResourceOpen(false);
                setSearchTerm("");
              }, 0);
            }
          }
        }
      }
    }
    // If neither slash nor @ is present, close both menus
    else {
      if (isCommandOpen) setIsCommandOpen(false);
      if (isResourceOpen) setIsResourceOpen(false);
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

    // Check for slash commands (/command) in the input
    const slashCommandMatch = inputValue.match(/^\/(\w+)(-\w+)*/);

    // Handle special commands first
    if (slashCommandMatch) {
      const commandName = slashCommandMatch[0];

      // Handle expand command
      if (commandName.startsWith("/expand")) {
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
      else if (commandName.startsWith("/weather")) {
        setShowWeatherTool(true);
        setInputValue("");
        setAiInput("");
        return;
      }

      // Check if it's a recognized prompt command from our list
      const matchedPrompt = prompts.find(
        (p) =>
          commandName === `/${p.name}` || commandName.startsWith(`/${p.name}-`)
      );

      if (matchedPrompt) {
        // If it's a recognized prompt, open the prompt form
        setActivePrompt(matchedPrompt);
        setInputValue("");
        setAiInput("");
        return;
      }

      // If we reach here, it's an unrecognized slash command, but we'll
      // still send it through to the API for further handling
    }

    // Check for resource references (@resource)
    const resourceReferences: string[] = [];

    // Log available resources for debugging
    console.log("Available resources in UI:", resources);

    if (resources.length === 0) {
      console.warn(
        "No resources available in the UI. Resource references will not work."
      );

      // Add a fallback message
      const userMsg = {
        id: nanoid(),
        role: "user" as const,
        content: inputValue,
      };

      setMessages([...messages, userMsg]);

      const assistantMsg = {
        id: nanoid(),
        role: "assistant" as const,
        content:
          "I see you're trying to reference resources, but no resources are available. Try typing '@' to see available resources.",
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setInputValue("");
      setAiInput("");
      return;
    }

    // Try to match resource references in the input
    let hasResourceReference = false;

    // Check for @ResourceName pattern in the input
    for (const resource of resources) {
      try {
        // First try exact match with escaped name
        const escapedName = resource.name.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        // Try matching the full resource name (exact match with word boundary)
        const exactPattern = new RegExp(`@${escapedName}\\b`, "g");
        const exactMatches = [...inputValue.matchAll(exactPattern)];

        if (exactMatches.length > 0) {
          console.log(
            `Found exact match for resource: ${resource.name} with URI: ${resource.uri}`
          );
          resourceReferences.push(`@${resource.name}`);
          hasResourceReference = true;
          continue;
        }

        // For resource names with spaces, try matching the exact quoted name
        if (resource.name.includes(" ")) {
          const exactQuotedPattern = new RegExp(`@"${escapedName}"`, "g");
          const exactQuotedMatches = [
            ...inputValue.matchAll(exactQuotedPattern),
          ];

          if (exactQuotedMatches.length > 0) {
            console.log(
              `Found exact quoted match for resource: ${resource.name} with URI: ${resource.uri}`
            );
            resourceReferences.push(`@${resource.name}`);
            hasResourceReference = true;
            continue;
          }
        }

        // If no exact match, try case-insensitive match
        const caseInsensitivePattern = new RegExp(`@${escapedName}\\b`, "gi");
        const fuzzyMatches = [...inputValue.matchAll(caseInsensitivePattern)];

        if (fuzzyMatches.length > 0) {
          console.log(
            `Found case-insensitive match for resource: ${resource.name} with URI: ${resource.uri}`
          );
          resourceReferences.push(`@${resource.name}`);
          hasResourceReference = true;
        }
      } catch (error) {
        console.error(`Error matching resource ${resource.name}:`, error);
      }
    }

    console.log("Detected resource references:", resourceReferences);

    // If we found resources, handle them
    if (hasResourceReference && resourceReferences.length > 0) {
      // Add user message
      const userMsg = {
        id: nanoid(),
        role: "user" as const,
        content: inputValue,
      };

      // Update local messages with the new user message
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInputValue("");
      setAiInput("");

      // Add assistant "thinking" message
      const assistantMessageId = nanoid();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "Processing your request with resources...",
          isLoading: true,
        },
      ]);

      try {
        const fetchedRefs: ResourceReference[] = [];

        // Get fresh resources to ensure we have the latest
        let currentResources = resources;
        try {
          console.log("Refreshing resources before processing references...");
          const freshResources = await refreshResources();
          if (freshResources && freshResources.length > 0) {
            console.log("Got fresh resources:", freshResources);
            setResources(freshResources);
            currentResources = freshResources;
          } else {
            console.warn(
              "Refresh returned empty resources, using existing resources"
            );
          }
        } catch (refreshError) {
          console.error("Error refreshing resources:", refreshError);
        }

        for (const ref of resourceReferences) {
          // Remove the @ symbol and find the matching resource
          let resourceName = ref.substring(1);

          // Handle quoted resource names
          if (resourceName.startsWith('"') && resourceName.endsWith('"')) {
            resourceName = resourceName.substring(1, resourceName.length - 1);
          }

          console.log(`Looking for resource with name: "${resourceName}"`);

          // Try more flexible matching
          const matchingResource = currentResources.find(
            (r) =>
              r.name === resourceName ||
              r.name.toLowerCase() === resourceName.toLowerCase() ||
              // For multi-word resources, try partial matching
              (r.name.includes(" ") &&
                resourceName
                  .split(" ")
                  .every((part) =>
                    r.name.toLowerCase().includes(part.toLowerCase())
                  ))
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
          // Send the content to the AI API with the fetched resources and entire message history
          fetch("/api/ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: updatedMessages, // Send all messages, not just the current one
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
                        content: receivedText,
                        isLoading: false,
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

      // Update messages with the new user message
      const updatedMessages = [...messages, userMsg];

      // Use AI SDK to stream the response
      appendAiMessage(userMsg);
      setInputValue("");
      setAiInput("");

      // Call our API endpoint with the prompt info and full message history
      fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages, // Send all messages, not just current one
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

    // Update local messages state with the new user message
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

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

    // Call the API with streaming, passing the ENTIRE conversation history
    fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updatedMessages, // Send all messages, not just the current one
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

    // Create a user message to show in the chat
    const userMsg = {
      id: nanoid(),
      role: "user" as const,
      content: `Running prompt: ${name} with args: ${Object.entries(args)
        .map(([key, value]) => `${key}="${value}"`)
        .join(", ")}`,
    };

    // Add a temporary "thinking" message from the assistant
    const assistantMsgId = nanoid();
    setMessages([
      ...messages,
      userMsg,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "Processing your request...",
        isLoading: true,
      },
    ]);

    try {
      // Call our API endpoint with the prompt info
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [userMsg],
          promptName: name,
          promptArgs: args,
        }),
      });

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
      const readChunk = async () => {
        try {
          const { done, value } = await reader.read();

          if (done) {
            // Streaming complete, update the final message
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === assistantMsgId
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
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: receivedText,
                    isLoading: true,
                  }
                : msg
            )
          );

          // Continue reading
          await readChunk();
        } catch (error) {
          console.error("Error reading stream:", error);
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: `Error processing response: ${error}`,
                    isLoading: false,
                  }
                : msg
            )
          );
        }
      };

      // Start reading the stream
      await readChunk();
    } catch (error) {
      console.error("Error calling AI API:", error);
      // Update message with error
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: `Error processing request: ${error}`,
                isLoading: false,
              }
            : msg
        )
      );
    }
  };

  // Function to cancel the prompt form
  const handlePromptCancel = () => {
    setActivePrompt(null);
  };

  // Handle weather tool submission
  const handleWeatherToolSubmit = (location: string) => {
    setShowWeatherTool(false);

    // Create user message
    const userMsg = {
      id: nanoid(),
      role: "user" as const,
      content: `Getting weather for: ${location}`,
    };

    // Add a temporary "thinking" message from the assistant
    const assistantMsgId = nanoid();
    setMessages([
      ...messages,
      userMsg,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "Fetching weather data...",
        isLoading: true,
      },
    ]);

    // Call our API endpoint with the weather tool info
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
        const readChunk = async () => {
          try {
            const { done, value } = await reader.read();

            if (done) {
              // Streaming complete, update the final message
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === assistantMsgId
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
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      content: receivedText,
                      isLoading: true,
                    }
                  : msg
              )
            );

            // Continue reading
            await readChunk();
          } catch (error) {
            console.error("Error reading stream:", error);
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      content: `Error processing response: ${error}`,
                      isLoading: false,
                    }
                  : msg
              )
            );
          }
        };

        // Start reading the stream
        readChunk();
      })
      .catch((error) => {
        console.error("Error calling weather API:", error);
        // Update message with error
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: `Error getting weather: ${error}`,
                  isLoading: false,
                }
              : msg
          )
        );
      });
  };

  // Function to cancel the weather tool form
  const handleWeatherToolCancel = () => {
    setShowWeatherTool(false);
  };

  const handleResourceSelect = (value: string) => {
    console.log("Resource selected with URI:", value);

    // Find the resource with this URI
    const selectedResource = resources.find((r) => r.uri === value);
    if (!selectedResource) {
      console.error("Selected resource not found in resources list:", value);
      setIsResourceOpen(false);
      return;
    }

    console.log("Found resource:", selectedResource.name);

    // Get the current value and find the last @ symbol
    const currentValue = inputValue;
    const lastAtIndex = currentValue.lastIndexOf("@");

    if (lastAtIndex === -1) {
      console.warn("No @ symbol found in current input");
      setIsResourceOpen(false);
      return;
    }

    // Replace everything from the @ to where the cursor is with the resource name
    const newValue =
      currentValue.substring(0, lastAtIndex + 1) + selectedResource.name + " ";

    // Update the input value
    setInputValue(newValue);
    setAiInput(newValue);

    // Update the textarea and put the cursor at the end
    if (textareaRef.current) {
      textareaRef.current.value = newValue;
      textareaRef.current.selectionStart = newValue.length;
      textareaRef.current.selectionEnd = newValue.length;
      textareaRef.current.focus();
    }

    // Ensure the resource popover is closed
    setIsResourceOpen(false);
    setSearchTerm("");
  };

  // Create categorized command groups for better organization
  const toolCommands = [
    {
      name: "weather",
      description: "Get the current weather for a location",
      category: "Tools",
    },
  ];

  // Optimize filtering logic - only filter when there's an actual search term (more than just a slash)
  const filteredPrompts = useMemo(() => {
    // If no search term or just the slash character, return all prompts
    if (!searchTerm || searchTerm === "") return prompts;

    return prompts.filter(
      (prompt) =>
        prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [prompts, searchTerm]);

  // All commands combined for backward compatibility
  const availableCommands = useMemo(
    () => [
      ...toolCommands,
      ...filteredPrompts.map((p) => ({
        name: p.name,
        description: p.description,
        category: "Content",
      })),
    ],
    [toolCommands, filteredPrompts]
  );

  // Create filtered commands by category for display in the UI
  const filteredToolCommands = useMemo(() => {
    // If no search term, return all tool commands without filtering
    if (!searchTerm || searchTerm === "") return toolCommands;

    return toolCommands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [toolCommands, searchTerm]);

  const filteredContentCommands = useMemo(
    () =>
      filteredPrompts.map((p) => ({
        name: p.name,
        description: p.description,
        category: "Content",
      })),
    [filteredPrompts]
  );

  // Fix for resource popover to make sure it shows resources correctly
  const filteredResources = useMemo(() => {
    // If no search term, show all resources
    if (!searchTerm || searchTerm.trim() === "") return resources;

    return resources.filter(
      (resource) =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        resource.uri.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [resources, searchTerm]);

  const handleExpanderDone = (targetLength: string) => {
    setShowExpander(false);

    if (targetLength) {
      handleExpandContent(expanderContent, targetLength);
    }
  };

  // Add more detailed logging
  useEffect(() => {
    console.log("Resources state updated:", resources);
    console.log("Current search term:", searchTerm);
    console.log("Filtered resources:", filteredResources);
    console.log("Available commands:", availableCommands);
  }, [resources, searchTerm, filteredResources, availableCommands]);

  // Add a useEffect to log resources when they change
  useEffect(() => {
    if (resources.length > 0) {
      console.log(
        "Resources available:",
        resources.map((r) => r.name).join(", ")
      );

      // Prepare welcome message
      let welcomeMessage = `Welcome! `;

      // Add resource info
      welcomeMessage += `You can reference resources by typing '@' followed by the resource name. Available resources: ${resources
        .map((r) => r.name)
        .join(", ")}. `;

      // Add command info if prompts are loaded
      if (prompts.length > 0) {
        welcomeMessage += `\n\nYou can also use slash commands by typing '/' followed by the command name. Available commands: ${prompts
          .map((p) => p.name)
          .join(", ")}, and 'weather'.`;
      }

      // Notify user about available resources and commands
      if (messages.length === 0) {
        const systemMsg = {
          id: nanoid(),
          role: "assistant" as const,
          content: welcomeMessage,
        };
        setMessages([systemMsg]);
      }
    }
  }, [resources, prompts, messages]);

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
      <CommandDialog
        open={isCommandOpen}
        onOpenChange={(open) => {
          setIsCommandOpen(open);
          if (!open) {
            // Reset search term when dialog is closed
            setSearchTerm("");
          }
        }}
      >
        <CommandInput
          placeholder="Search available commands..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          autoFocus={true}
          className="text-base font-medium !text-foreground"
        />
        <CommandList className="font-sans max-h-[300px] overflow-y-auto">
          <CommandEmpty>No commands found.</CommandEmpty>

          {/* Tool Commands Group - Removed conditional to ensure they always appear */}
          <CommandGroup
            heading="Tool Commands"
            className="font-medium text-base"
          >
            {filteredToolCommands.map((command) => (
              <CommandItem
                key={command.name}
                value={command.name}
                onSelect={handleCommandSelect}
                className="text-base font-normal !text-foreground antialiased hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale",
                  textRendering: "optimizeLegibility",
                }}
              >
                <div className="w-full py-1">
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

          {/* Content Commands Group - Removed conditional to ensure they always appear */}
          <CommandGroup
            heading="Content Commands"
            className="font-medium text-base"
          >
            {filteredContentCommands.map((command) => (
              <CommandItem
                key={command.name}
                value={command.name}
                onSelect={handleCommandSelect}
                className="text-base font-normal !text-foreground antialiased hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale",
                  textRendering: "optimizeLegibility",
                }}
              >
                <div className="w-full py-1">
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
      <Popover
        open={isResourceOpen}
        onOpenChange={(open) => {
          setIsResourceOpen(open);
          if (!open) {
            // Reset search term when popover is closed
            setSearchTerm("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            className="absolute opacity-0"
            style={{ pointerEvents: "none" }}
          >
            Resources
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[300px] p-0"
          align="start"
          side="top"
          sideOffset={10}
          avoidCollisions={true}
        >
          <Command>
            <CommandInput
              placeholder="Search resources..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              autoFocus={true}
              className="text-base font-medium !text-foreground"
            />
            <CommandList className="font-sans max-h-[300px] overflow-y-auto">
              <CommandEmpty>No resources found.</CommandEmpty>
              <CommandGroup
                heading="Available Resources"
                className="font-medium text-base"
              >
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <CommandItem
                      key={resource.uri}
                      value={resource.uri}
                      onSelect={handleResourceSelect}
                      className="text-base font-normal !text-foreground antialiased hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{
                        WebkitFontSmoothing: "antialiased",
                        MozOsxFontSmoothing: "grayscale",
                        textRendering: "optimizeLegibility",
                      }}
                    >
                      <div className="w-full py-1">
                        <div className="font-medium text-foreground not-italic">
                          {resource.name}
                        </div>
                        <div className="text-xs text-muted-foreground not-italic antialiased">
                          {resource.description || resource.uri}
                        </div>
                      </div>
                    </CommandItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">
                    Loading resources...
                  </div>
                )}
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
