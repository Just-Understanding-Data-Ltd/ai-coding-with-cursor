"use client";

import { useRef } from "react";
import { MessageSquare, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
  useQuery,
  HydrationBoundary,
  DehydratedState,
} from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useChat } from "@ai-sdk/react";
import { getChat, getMessages, useDeleteChat } from "@repo/supabase";
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

interface ChatClientProps {
  chatId: string;
  orgId: string;
  teamId: string;
  dehydratedState: DehydratedState;
}

export default function ChatClient({
  chatId,
  orgId,
  teamId,
  dehydratedState,
}: ChatClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mutate: deleteChat, isPending: isDeleting } = useDeleteChat({
    supabase,
    options: {
      onSuccess: () => {
        // Navigate back to the chat landing page after deletion
        router.push(`/org/${orgId}/${teamId}/chat`);
      },
    },
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

  // Use AI SDK's useChat hook with initial messages from the database
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isAiLoading,
  } = useChat({
    api: "/api/chat",
    body: { chatId },
    initialMessages:
      initialMessages?.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })) || [],
  });

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
      <div className="flex flex-col h-full w-full">
        <header className="border-b p-4">
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Start a conversation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Type a message below to start chatting with the AI.
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
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isAiLoading || isDeleting}
            />
            <Button
              type="submit"
              disabled={isAiLoading || !input.trim() || isDeleting}
            >
              {isAiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send"
              )}
            </Button>
          </form>
        </div>
      </div>
    </HydrationBoundary>
  );
}
