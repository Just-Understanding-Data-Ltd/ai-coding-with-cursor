"use client";

import {
  useQuery,
  type UseQueryOptions,
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { moduleToast } from "../lib/toast";
import { SupabaseClient } from "../index";
import {
  type Message,
  type MessageInsert,
  type MessageUpdate,
  type MessageRole,
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  MessageOperationError,
} from "./messages";
import { Json } from "../database.types";

type QueryKey = readonly [string, ...unknown[]];

/**
 * React Query key factory for message-related queries
 */
export const messageKeys = {
  all: ["messages"] as const,
  lists: () => [...messageKeys.all, "list"] as const,
  list: (chatId: string) => [...messageKeys.lists(), chatId] as const,
  details: () => [...messageKeys.all, "detail"] as const,
  detail: (messageId: string) => [...messageKeys.details(), messageId] as const,
};

/**
 * Hook to fetch messages for a chat
 */
export function useMessages({
  chatId,
  page = 1,
  pageSize = 50,
  supabase,
  options = {},
}: {
  chatId: string;
  page?: number;
  pageSize?: number;
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<Message[], MessageOperationError>>;
}) {
  const queryKey = [...messageKeys.list(chatId), { page, pageSize }];

  const queryFn = async () => getMessages({ supabase, chatId, page, pageSize });

  return useQuery<Message[], MessageOperationError>({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * Hook to create a new message
 */
export function useCreateMessage({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      Message,
      MessageOperationError,
      {
        chatId: string;
        content: string;
        role: MessageRole;
        userId?: string;
        tokensUsed?: number;
        metadata?: Json;
      }
    >
  >;
}): UseMutationResult<
  Message,
  MessageOperationError,
  {
    chatId: string;
    content: string;
    role: MessageRole;
    userId?: string;
    tokensUsed?: number;
    metadata?: Json;
  }
> {
  const queryClient = useQueryClient();

  return useMutation<
    Message,
    MessageOperationError,
    {
      chatId: string;
      content: string;
      role: MessageRole;
      userId?: string;
      tokensUsed?: number;
      metadata?: Json;
    }
  >({
    mutationFn: async ({
      chatId,
      content,
      role,
      userId,
      tokensUsed,
      metadata,
    }) =>
      createMessage({
        supabase,
        chatId,
        content,
        role,
        userId,
        tokensUsed,
        metadata,
      }),

    onSuccess: (data, variables) => {
      // Invalidate the messages list for this chat
      queryClient.invalidateQueries({
        queryKey: messageKeys.list(variables.chatId),
      });

      // Don't show a success toast for messages as they are created frequently
    },

    onError: (error) => {
      moduleToast.error(`${error.toastMessage}`);
    },

    ...options,
  });
}

/**
 * Hook to update a message
 */
export function useUpdateMessage({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      Message,
      MessageOperationError,
      { messageId: string; message: Omit<MessageUpdate, "id">; chatId: string }
    >
  >;
}): UseMutationResult<
  Message,
  MessageOperationError,
  { messageId: string; message: Omit<MessageUpdate, "id">; chatId: string }
> {
  const queryClient = useQueryClient();

  return useMutation<
    Message,
    MessageOperationError,
    { messageId: string; message: Omit<MessageUpdate, "id">; chatId: string }
  >({
    mutationFn: async ({ messageId, message }) =>
      updateMessage({ supabase, messageId, message }),

    onSuccess: (data, variables) => {
      // Update the message in the cache
      queryClient.setQueryData(messageKeys.detail(variables.messageId), data);

      // Invalidate the messages list for this chat
      queryClient.invalidateQueries({
        queryKey: messageKeys.list(variables.chatId),
      });

      // Don't show a success toast for message updates
    },

    onError: (error) => {
      moduleToast.error(`${error.toastMessage}`);
    },

    ...options,
  });
}

/**
 * Hook to delete a message
 */
export function useDeleteMessage({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      void,
      MessageOperationError,
      { messageId: string; chatId: string }
    >
  >;
}): UseMutationResult<
  void,
  MessageOperationError,
  { messageId: string; chatId: string }
> {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    MessageOperationError,
    { messageId: string; chatId: string }
  >({
    mutationFn: async ({ messageId }) => deleteMessage({ supabase, messageId }),

    onSuccess: (_, variables) => {
      // Remove the message from the cache
      queryClient.removeQueries({
        queryKey: messageKeys.detail(variables.messageId),
      });

      // Invalidate the messages list for this chat
      queryClient.invalidateQueries({
        queryKey: messageKeys.list(variables.chatId),
      });

      moduleToast.success("Message deleted successfully!");
    },

    onError: (error) => {
      moduleToast.error(`${error.toastMessage}`);
    },

    ...options,
  });
}
