"use client";

import { useRef, useEffect, useState } from "react";
import {
  MessageSquare,
  Loader2,
  ArrowLeft,
  Trash2,
  CalendarDays,
  Clock,
  Info,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Command,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
  useQuery,
  HydrationBoundary,
  DehydratedState,
  useQueryClient,
} from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useChat, Message as AIMessage } from "@ai-sdk/react";
import {
  getChat,
  getMessages,
  useDeleteChat,
  useUpdateChat,
} from "@repo/supabase";
import { Chat, Message } from "@repo/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AppointmentToolResponse from "./AppointmentToolResponse";
import AppointmentUI from "./AppointmentUI";

// Define a type to match AppointmentToolResponse props
interface AppointmentToolInfo {
  name: string;
  parameters: any;
  output: {
    success: boolean;
    message: string;
    appointmentId?: string;
    details?: {
      date?: string;
      time?: string;
      service?: string;
      customerName?: string;
    };
    appointments?: Array<{
      id: string;
      date: string;
      time: string;
      service: string;
      status: string;
    }>;
    count?: number;
    showForm?: boolean;
  };
}

interface ChatClientProps {
  chatId: string;
  orgId: string;
  teamId: string;
  dehydratedState: DehydratedState;
}

// Modify the QuickActionButton to submit form automatically
const QuickActionButton = ({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <Button
    variant="outline"
    className="flex items-center gap-2 px-4 py-2 w-full"
    onClick={onClick}
    disabled={disabled}
  >
    {icon}
    <span>{label}</span>
  </Button>
);

// Define available quick actions with their icons, labels, and input text
const quickActions = [
  {
    icon: <CalendarDays className="h-4 w-4" />,
    label: "Book Appointment",
    input: "I'd like to book an appointment",
  },
  {
    icon: <Clock className="h-4 w-4" />,
    label: "View Appointments",
    input: "Can I see my appointments? My email is customer@example.com",
  },
  {
    icon: <Info className="h-4 w-4" />,
    label: "Product Info",
    input: "Tell me about your products",
  },
  {
    icon: <HelpCircle className="h-4 w-4" />,
    label: "Tech Support",
    input: "I need technical support",
  },
];

export default function ChatClient({
  chatId,
  orgId,
  teamId,
  dehydratedState,
}: ChatClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // UI state
  const [activeAppointmentFormId, setActiveAppointmentFormId] = useState<
    string | null
  >(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const { mutate: deleteChat, isPending: isDeleting } = useDeleteChat({
    supabase,
    options: {
      onSuccess: () => {
        router.push(`/org/${orgId}/${teamId}/chat`);
      },
    },
  });

  const { mutate: updateChat } = useUpdateChat({
    supabase,
  });

  const {
    data: chatFromDB,
    error: chatError,
    isLoading: chatLoading,
  } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => getChat({ supabase, chatId }),
  });

  const {
    data: messagesFromDB,
    error: messagesError,
    isLoading: messagesLoading,
  } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessages({ supabase, chatId }),
  });

  // Destructure data for easier access
  const chat = chatFromDB as Chat | undefined;
  const initialMessages = messagesFromDB as Message[] | undefined;

  // Convert stored tool_calls to the format expected by useChat
  const convertStoredToolCalls = (message: Message) => {
    if (!message.tool_calls) return undefined;

    try {
      const toolCalls = message.tool_calls as any[];
      return toolCalls.map((tc) => ({
        name: tc.type,
        parameters: tc.parameters,
        output: tc.result,
      }));
    } catch (e) {
      console.error("Failed to parse tool calls:", e);
      return undefined;
    }
  };

  // Custom submit handler to update chat title on first message
  const customSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If this is the first message and the chat title is "New Chat"
    if (
      (!initialMessages || initialMessages.length === 0) &&
      chat?.title === "New Chat"
    ) {
      // Get a concise title from the input (first few words or up to 50 chars)
      const title = input.split(/\s+/).slice(0, 6).join(" ");
      const truncatedTitle =
        title.length > 50 ? title.substring(0, 47) + "..." : title;

      // Update the chat title
      updateChat({
        chatId,
        chat: { title: truncatedTitle },
      });
    }

    // Close any active appointment forms and UI elements
    setActiveAppointmentFormId(null);
    setCommandOpen(false);

    // Call the original submit handler
    handleSubmit(e);
  };

  // Use AI SDK's useChat hook with initial messages from the database
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
    setInput,
  } = useChat({
    api: "/api/chat",
    body: { chatId },
    // Use any type to avoid TypeScript errors with initialMessages format
    initialMessages:
      (initialMessages?.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
        toolInvocations: convertStoredToolCalls(msg),
      })) as any[]) || [],
    onResponse: (response) => {
      // Scroll to bottom when we start receiving a response
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    },
    onFinish: () => {
      // Scroll to bottom when the response is complete
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      // Refetch messages to ensure we have the latest state
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
    },
  });

  // Handle form submission from the AppointmentUI component
  const handleBookAppointment = (
    date: string,
    time: string,
    service: string,
    name: string,
    email: string
  ) => {
    // Reset active form
    setActiveAppointmentFormId(null);

    // Create the message as if the user typed it
    const appointmentMessage = `I'd like to book an appointment for ${service} on ${date} at ${time}. My name is ${name} and my email is ${email}.`;

    // Set the input to this message
    setInput(appointmentMessage);

    // Submit immediately without a timeout
    handleSubmit(new Event("submit") as any);
  };

  // Define a function to auto-submit a message
  const autoSubmitMessage = (message: string) => {
    // Set the input and then submit the form
    setInput(message);
    // Use setTimeout to ensure the input is set before submitting
    setTimeout(() => {
      handleSubmit(new Event("submit") as any);
    }, 0);
  };

  // Define a consistent helper function to handle command selection and form submission
  const handleCommandSelection = (inputText: string) => {
    console.log("Command selected:", inputText);

    // Close the dialog
    setCommandOpen(false);

    // Set the input text
    setInput(inputText);

    // Submit the form after a short delay
    requestAnimationFrame(() => {
      console.log("Submitting form with:", inputText);
      const event = new Event("submit") as any;
      handleSubmit(event);

      // Focus the input field after submission
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    });
  };

  // Handle command menu action selection
  const executeCommand = (command: string) => {
    handleCommandSelection(command);
  };

  // Monitor for slash commands in the input
  useEffect(() => {
    if (input === "/") {
      setCommandOpen(true);
      // Clear the input when opening the command dialog
      setInput("");
    }
  }, [input]);

  // Scroll to bottom on initial load and when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update messages when initialMessages changes (e.g., after refetch)
  useEffect(() => {
    if (initialMessages) {
      // Use any type to avoid TypeScript errors
      const formattedMessages = initialMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
        toolInvocations: convertStoredToolCalls(msg),
      })) as any[];

      setMessages(formattedMessages);
    }
  }, [initialMessages, setMessages]);

  // Check if the AI is currently processing a response
  const isProcessing = status === "streaming" || status === "submitted";

  // Add a useEffect for the CMD+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Check for CMD+K or CTRL+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Handle loading state
  if (chatLoading || messagesLoading) {
    return (
      <div className="flex flex-col h-full w-full p-4">
        <div className="flex items-center mb-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (chatError || messagesError || !chat) {
    const errorMessage =
      chatError instanceof Error ? chatError.message : "Unknown error";
    const isNotFoundError =
      errorMessage.includes("no rows") || errorMessage.includes("not found");

    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-xl font-semibold mb-2">Chat Not Found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          {isNotFoundError
            ? "This chat doesn't exist or has been deleted."
            : `Error: ${errorMessage}`}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => router.push(`/org/${orgId}/${teamId}/chat`)}
            variant="default"
          >
            Go to Chats
          </Button>
          <Button
            onClick={() => router.push(`/org/${orgId}/${teamId}/chat/new`)}
            variant="outline"
          >
            Start New Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="flex flex-col h-screen w-full">
        <header className="border-b p-4 sticky top-0 z-10 bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push(`/org/${orgId}/${teamId}`)}
                variant="ghost"
                size="sm"
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
              <h1 className="text-xl font-semibold">{chat.title}</h1>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this chat? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteChat({ chatId, teamId })}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">
                Welcome to Cursor Industries Customer Support
              </h3>
              <p className="text-muted-foreground mt-2 mb-6 max-w-md">
                I can help you with booking appointments, answering product
                questions, providing technical support, and more. Try one of the
                quick actions below or type a message to get started.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full mb-4">
                {quickActions.map((action, index) => (
                  <QuickActionButton
                    key={`welcome-action-${index}`}
                    icon={action.icon}
                    label={action.label}
                    onClick={() => autoSubmitMessage(action.input)}
                    disabled={isProcessing}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {/* Display message text */}
                    {message.parts.map((part, index) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <p
                              key={`${message.id}-${index}`}
                              className="whitespace-pre-wrap break-words"
                            >
                              {part.text}
                            </p>
                          );
                        case "tool-invocation":
                          // Get the tool invocation details
                          const { toolInvocation } = part;

                          // Show appointment form for showAppointmentForm tool
                          if (
                            toolInvocation.toolName === "showAppointmentForm" &&
                            toolInvocation.state === "result"
                          ) {
                            // Set this as the active form if not already set
                            if (
                              activeAppointmentFormId !==
                              toolInvocation.toolCallId
                            ) {
                              setActiveAppointmentFormId(
                                toolInvocation.toolCallId
                              );
                            }

                            // Don't show anything in the message bubble for this tool
                            return null;
                          }

                          // Only show streaming tool invocations with results
                          if (part.toolInvocation.state === "result") {
                            // Transform to AppointmentToolInfo format
                            const toolInfo: AppointmentToolInfo = {
                              name: part.toolInvocation.toolName,
                              parameters: part.toolInvocation.args,
                              output: part.toolInvocation.result,
                            };

                            return (
                              <div
                                key={`${message.id}-${index}`}
                                className="mt-2"
                              >
                                <AppointmentToolResponse
                                  toolInvocation={toolInfo}
                                />
                              </div>
                            );
                          }

                          // For in-progress tool invocations, show loading indicator
                          if (part.toolInvocation.toolName) {
                            return (
                              <div
                                key={`${message.id}-${index}`}
                                className="mt-2 flex items-center gap-2"
                              >
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">
                                  Processing {part.toolInvocation.toolName}...
                                </span>
                              </div>
                            );
                          }

                          // Skip undefined tool invocations
                          return null;
                        default:
                          return null;
                      }
                    })}

                    {/* Display persisted tool calls from database */}
                    {/* Always show persisted tool calls when available */}
                    {message.toolInvocations &&
                      message.toolInvocations.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.toolInvocations
                            .filter(
                              (invocation: any) =>
                                invocation.name !== "showAppointmentForm"
                            )
                            .map((toolInvocation: any, idx) => (
                              <AppointmentToolResponse
                                key={`${message.id}-tool-${idx}`}
                                toolInvocation={toolInvocation}
                              />
                            ))}
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {/* Persistent quick actions after messages */}
              {messages.length > 0 &&
                !activeAppointmentFormId &&
                !isProcessing && (
                  <div className="flex justify-center my-4">
                    <Collapsible className="w-full max-w-md mx-auto">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 w-full"
                          onClick={() => setShowQuickActions(!showQuickActions)}
                        >
                          <span>Quick Actions</span>
                          {showQuickActions ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="grid grid-cols-2 gap-2">
                          {quickActions.map((action, index) => (
                            <QuickActionButton
                              key={`quick-action-${index}`}
                              icon={action.icon}
                              label={action.label}
                              onClick={() => autoSubmitMessage(action.input)}
                              disabled={isProcessing}
                            />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
            </>
          )}

          {/* Render appointment form if there is an active form */}
          {activeAppointmentFormId && (
            <div className="flex justify-center my-4">
              <AppointmentUI
                teamId={teamId}
                onBook={handleBookAppointment}
                onCancel={() => setActiveAppointmentFormId(null)}
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-10 mx-auto max-w-[900px] shadow-lg">
          <div className="mx-auto max-w-[700px]">
            <form onSubmit={customSubmit} className="flex items-center gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Type / for commands..."
                className="flex-1 rounded-full border-2 focus-visible:ring-2 focus-visible:ring-offset-1"
                disabled={isProcessing || isDeleting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setActiveAppointmentFormId("manual-trigger");
                }}
                disabled={
                  isProcessing || isDeleting || activeAppointmentFormId !== null
                }
                className="rounded-full hover:bg-accent transition-colors"
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isProcessing || isDeleting}
                    className="rounded-full hover:bg-accent transition-colors"
                  >
                    <Command className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-60 p-0 rounded-lg border-2"
                  align="end"
                >
                  <div className="grid gap-2 p-3">
                    <h4 className="text-sm font-medium">Quick Actions</h4>
                    {quickActions.map((action, index) => (
                      <Button
                        key={`popover-action-${index}`}
                        variant="ghost"
                        className="justify-start gap-2 px-3 rounded-lg hover:bg-accent transition-colors"
                        onClick={() => autoSubmitMessage(action.input)}
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                type="submit"
                disabled={isProcessing || !input.trim() || isDeleting}
                className="rounded-full px-6 hover:opacity-90 transition-opacity"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Command Dialog for slash commands */}
        <CommandDialog
          open={commandOpen}
          onOpenChange={(open) => {
            setCommandOpen(open);
            // If the dialog is closing, focus the input box
            if (!open && inputRef.current) {
              // Short delay to ensure DOM is updated
              setTimeout(() => {
                inputRef.current?.focus();
              }, 10);
            }
          }}
        >
          <div className="sr-only">
            <DialogTitle>Command Menu</DialogTitle>
          </div>
          <CommandInput placeholder="Type a command or search..." autoFocus />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Quick Actions">
              {quickActions.map((action, index) => (
                <CommandItem
                  key={`command-${index}`}
                  value={action.label}
                  onSelect={() => handleCommandSelection(action.input)}
                >
                  <div className="flex items-center gap-2">
                    {action.icon}
                    <span>{action.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Other Commands">
              <CommandItem
                value="Services"
                onSelect={() =>
                  handleCommandSelection("What services do you offer?")
                }
              >
                <Search className="h-4 w-4 mr-2" />
                <span>Services</span>
              </CommandItem>
              <CommandItem
                value="Contact Support"
                onSelect={() =>
                  handleCommandSelection("How can I contact your support team?")
                }
              >
                <Search className="h-4 w-4 mr-2" />
                <span>Contact Support</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </HydrationBoundary>
  );
}
