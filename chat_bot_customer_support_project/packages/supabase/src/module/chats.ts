import { SupabaseOperationError, SupabaseErrorCode } from "../errors";
import { SupabaseClient } from "../index";
import { Tables, TablesInsert, TablesUpdate } from "../database.types";

/**
 * Represents a chat.
 */
export type Chat = Tables<"chats">;

/**
 * Represents the data required to insert a new chat.
 */
export type ChatInsert = TablesInsert<"chats">;

/**
 * Represents the data required to update an existing chat.
 */
export type ChatUpdate = TablesUpdate<"chats">;

/**
 * Custom error class for chat operations.
 */
export class ChatOperationError extends SupabaseOperationError {
  constructor(
    operation: string,
    context: string,
    toastMessage: string,
    errorCode: SupabaseErrorCode,
    cause?: unknown
  ) {
    super(operation, context, toastMessage, errorCode, cause);
    this.name = "ChatOperationError";
  }
}

/**
 * Create a new chat for a team
 * @param params - Parameters for creating a chat
 * @returns The created chat
 */
export async function createChat({
  supabase,
  teamId,
  title,
  userId,
}: {
  supabase: SupabaseClient;
  teamId: string;
  title?: string;
  userId?: string;
}): Promise<Chat> {
  try {
    const { data, error } = await supabase
      .from("chats")
      .insert({
        team_id: teamId,
        title: title || "New Chat",
        created_by: userId,
      })
      .select("*")
      .single();

    if (error) {
      throw new ChatOperationError(
        "createChat",
        `Failed to create chat for team ${teamId}`,
        "Failed to create chat",
        SupabaseErrorCode.CREATE_FAILED,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ChatOperationError) {
      throw error;
    }

    throw new ChatOperationError(
      "createChat",
      "Unexpected error while creating chat",
      "Failed to create chat",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Get a chat by its ID
 * @param params - Parameters for getting a chat
 * @returns The chat or null if not found
 */
export async function getChat({
  supabase,
  chatId,
}: {
  supabase: SupabaseClient;
  chatId: string;
}): Promise<Chat | null> {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }

      throw new ChatOperationError(
        "getChat",
        `Failed to get chat ${chatId}`,
        "Failed to load chat",
        SupabaseErrorCode.READ_FAILED,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ChatOperationError) {
      throw error;
    }

    throw new ChatOperationError(
      "getChat",
      "Unexpected error while getting chat",
      "Failed to load chat",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Get all chats for a team
 * @param params - Parameters for getting chats
 * @returns Array of chats
 */
export async function getChats({
  supabase,
  teamId,
}: {
  supabase: SupabaseClient;
  teamId: string;
}): Promise<Chat[]> {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("team_id", teamId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new ChatOperationError(
        "getChats",
        `Failed to get chats for team ${teamId}`,
        "Failed to load chats",
        SupabaseErrorCode.READ_FAILED,
        error
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof ChatOperationError) {
      throw error;
    }

    throw new ChatOperationError(
      "getChats",
      "Unexpected error while getting chats",
      "Failed to load chats",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Update a chat
 * @param params - Parameters for updating a chat
 * @returns The updated chat
 */
export async function updateChat({
  supabase,
  chatId,
  chat,
}: {
  supabase: SupabaseClient;
  chatId: string;
  chat: Omit<ChatUpdate, "id">;
}): Promise<Chat> {
  try {
    const { data, error } = await supabase
      .from("chats")
      .update(chat)
      .eq("id", chatId)
      .select("*")
      .single();

    if (error) {
      throw new ChatOperationError(
        "updateChat",
        `Failed to update chat ${chatId}`,
        "Failed to update chat",
        SupabaseErrorCode.UPDATE_FAILED,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ChatOperationError) {
      throw error;
    }

    throw new ChatOperationError(
      "updateChat",
      "Unexpected error while updating chat",
      "Failed to update chat",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Delete a chat
 * @param params - Parameters for deleting a chat
 * @returns void
 */
export async function deleteChat({
  supabase,
  chatId,
}: {
  supabase: SupabaseClient;
  chatId: string;
}): Promise<void> {
  try {
    const { error } = await supabase.from("chats").delete().eq("id", chatId);

    if (error) {
      throw new ChatOperationError(
        "deleteChat",
        `Failed to delete chat ${chatId}`,
        "Failed to delete chat",
        SupabaseErrorCode.DELETE_FAILED,
        error
      );
    }
  } catch (error) {
    if (error instanceof ChatOperationError) {
      throw error;
    }

    throw new ChatOperationError(
      "deleteChat",
      "Unexpected error while deleting chat",
      "Failed to delete chat",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}
