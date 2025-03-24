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
  type Chat,
  type ChatInsert,
  type ChatUpdate,
  getChat,
  getChats,
  createChat,
  updateChat,
  deleteChat,
  ChatOperationError,
} from "./chats";

type QueryKey = readonly [string, ...unknown[]];

/**
 * React Query key factory for chat-related queries
 */
export const chatKeys = {
  all: ["chats"] as const,
  lists: () => [...chatKeys.all, "list"] as const,
  list: (teamId: string) => [...chatKeys.lists(), teamId] as const,
  details: () => [...chatKeys.all, "detail"] as const,
  detail: (chatId: string) => [...chatKeys.details(), chatId] as const,
};

/**
 * Hook to fetch a single chat by ID
 */
export function useChat({
  chatId,
  supabase,
  options = {},
}: {
  chatId: string;
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<Chat | null, ChatOperationError>>;
}) {
  const queryKey = chatKeys.detail(chatId);

  const queryFn = async () => getChat({ supabase, chatId });

  return useQuery<Chat | null, ChatOperationError>({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * Hook to fetch all chats for a team
 */
export function useChats({
  teamId,
  supabase,
  options = {},
}: {
  teamId: string;
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<Chat[], ChatOperationError>>;
}) {
  const queryKey = chatKeys.list(teamId);

  const queryFn = async () => getChats({ supabase, teamId });

  return useQuery<Chat[], ChatOperationError>({
    queryKey,
    queryFn,
    ...options,
  });
}
/**
 * Hook to create a new chat
 */
export function useCreateChat({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      Chat,
      ChatOperationError,
      { teamId: string; title?: string; userId?: string }
    >
  >;
}): UseMutationResult<
  Chat,
  ChatOperationError,
  { teamId: string; title?: string; userId?: string }
> {
  const queryClient = useQueryClient();

  return useMutation<
    Chat,
    ChatOperationError,
    { teamId: string; title?: string; userId?: string }
  >({
    mutationFn: async ({ teamId, title, userId }) =>
      createChat({ supabase, teamId, title, userId }),

    onSuccess: (data, variables) => {
      // Invalidate the chats list for this team
      queryClient.invalidateQueries({
        queryKey: chatKeys.list(variables.teamId),
      });

      // Add the new chat to the cache
      queryClient.setQueryData(chatKeys.detail(data.id), data);

      moduleToast.success("Chat created successfully!");
    },

    onError: (error) => {
      moduleToast.error(`${error.toastMessage}`);
    },

    ...options,
  });
}

/**
 * Hook to update a chat
 */
export function useUpdateChat({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      Chat,
      ChatOperationError,
      { chatId: string; chat: Omit<ChatUpdate, "id"> }
    >
  >;
}): UseMutationResult<
  Chat,
  ChatOperationError,
  { chatId: string; chat: Omit<ChatUpdate, "id"> }
> {
  const queryClient = useQueryClient();

  return useMutation<
    Chat,
    ChatOperationError,
    { chatId: string; chat: Omit<ChatUpdate, "id"> }
  >({
    mutationFn: async ({ chatId, chat }) =>
      updateChat({ supabase, chatId, chat }),

    onSuccess: (data, variables) => {
      // Update the chat in the cache
      queryClient.setQueryData(chatKeys.detail(variables.chatId), data);

      // Get the team ID from the updated data
      const teamId = data.team_id;

      // Invalidate the chats list for this team
      queryClient.invalidateQueries({
        queryKey: chatKeys.list(teamId),
      });

      moduleToast.success("Chat updated successfully!");
    },

    onError: (error) => {
      moduleToast.error(`${error.toastMessage}`);
    },

    ...options,
  });
}

/**
 * Hook to delete a chat
 */
export function useDeleteChat({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      void,
      ChatOperationError,
      { chatId: string; teamId: string }
    >
  >;
}): UseMutationResult<
  void,
  ChatOperationError,
  { chatId: string; teamId: string }
> {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ChatOperationError,
    { chatId: string; teamId: string }
  >({
    mutationFn: async ({ chatId }) => deleteChat({ supabase, chatId }),

    onSuccess: (_, variables) => {
      // Remove the chat from the cache
      queryClient.removeQueries({
        queryKey: chatKeys.detail(variables.chatId),
      });

      // Invalidate the chats list for this team
      queryClient.invalidateQueries({
        queryKey: chatKeys.list(variables.teamId),
      });

      moduleToast.success("Chat deleted successfully!");
    },

    onError: (error) => {
      moduleToast.error(`${error.toastMessage}`);
    },

    ...options,
  });
}
