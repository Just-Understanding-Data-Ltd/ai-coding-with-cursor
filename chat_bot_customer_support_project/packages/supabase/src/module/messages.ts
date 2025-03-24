import { SupabaseOperationError, SupabaseErrorCode } from "../errors";
import { SupabaseClient } from "../index";
import { Tables, TablesInsert, TablesUpdate, Json } from "../database.types";

/**
 * Represents a message.
 */
export type Message = Tables<"messages">;

/**
 * Represents the data required to insert a new message.
 */
export type MessageInsert = TablesInsert<"messages">;

/**
 * Represents the data required to update an existing message.
 */
export type MessageUpdate = TablesUpdate<"messages">;

/**
 * Valid roles for a message sender
 */
export type MessageRole = "user" | "assistant" | "system";

/**
 * Custom error class for message operations.
 */
export class MessageOperationError extends SupabaseOperationError {
  constructor(
    operation: string,
    context: string,
    toastMessage: string,
    errorCode: SupabaseErrorCode,
    cause?: unknown
  ) {
    super(operation, context, toastMessage, errorCode, cause);
    this.name = "MessageOperationError";
  }
}

/**
 * Create a new message in a chat
 * @param params - Parameters for creating a message
 * @returns The created message
 */
export async function createMessage({
  supabase,
  chatId,
  content,
  role,
  userId,
  tokensUsed,
  metadata,
}: {
  supabase: SupabaseClient;
  chatId: string;
  content: string;
  role: MessageRole;
  userId?: string;
  tokensUsed?: number;
  metadata?: Json;
}): Promise<Message> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        content,
        role,
        created_by: userId,
        tokens_used: tokensUsed,
        metadata,
      })
      .select("*")
      .single();

    if (error) {
      throw new MessageOperationError(
        "createMessage",
        `Failed to create message in chat ${chatId}`,
        "Failed to send message",
        SupabaseErrorCode.CREATE_FAILED,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof MessageOperationError) {
      throw error;
    }

    throw new MessageOperationError(
      "createMessage",
      "Unexpected error while creating message",
      "Failed to send message",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Get all messages for a chat
 * @param params - Parameters for getting messages
 * @returns Array of messages
 */
export async function getMessages({
  supabase,
  chatId,
  page = 1,
  pageSize = 50,
}: {
  supabase: SupabaseClient;
  chatId: string;
  page?: number;
  pageSize?: number;
}): Promise<Message[]> {
  try {
    // Calculate range start and end for pagination
    const rangeStart = (page - 1) * pageSize;
    const rangeEnd = rangeStart + pageSize - 1;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .range(rangeStart, rangeEnd);

    if (error) {
      throw new MessageOperationError(
        "getMessages",
        `Failed to get messages for chat ${chatId}`,
        "Failed to load messages",
        SupabaseErrorCode.READ_FAILED,
        error
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof MessageOperationError) {
      throw error;
    }

    throw new MessageOperationError(
      "getMessages",
      "Unexpected error while getting messages",
      "Failed to load messages",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Update a message
 * @param params - Parameters for updating a message
 * @returns The updated message
 */
export async function updateMessage({
  supabase,
  messageId,
  message,
}: {
  supabase: SupabaseClient;
  messageId: string;
  message: Omit<MessageUpdate, "id">;
}): Promise<Message> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .update(message)
      .eq("id", messageId)
      .select("*")
      .single();

    if (error) {
      throw new MessageOperationError(
        "updateMessage",
        `Failed to update message ${messageId}`,
        "Failed to update message",
        SupabaseErrorCode.UPDATE_FAILED,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof MessageOperationError) {
      throw error;
    }

    throw new MessageOperationError(
      "updateMessage",
      "Unexpected error while updating message",
      "Failed to update message",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Delete a message
 * @param params - Parameters for deleting a message
 * @returns void
 */
export async function deleteMessage({
  supabase,
  messageId,
}: {
  supabase: SupabaseClient;
  messageId: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      throw new MessageOperationError(
        "deleteMessage",
        `Failed to delete message ${messageId}`,
        "Failed to delete message",
        SupabaseErrorCode.DELETE_FAILED,
        error
      );
    }
  } catch (error) {
    if (error instanceof MessageOperationError) {
      throw error;
    }

    throw new MessageOperationError(
      "deleteMessage",
      "Unexpected error while deleting message",
      "Failed to delete message",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}
