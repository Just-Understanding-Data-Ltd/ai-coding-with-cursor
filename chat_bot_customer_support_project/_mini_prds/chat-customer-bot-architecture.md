# Chat Customer Bot Architecture

This document outlines the technical architecture of the Chat Customer Bot application, showing how different components interact. Authentication is already implemented in the existing codebase.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Next.js Application                         │
│                                                                     │
│  ┌───────────────┐      ┌────────────────┐      ┌────────────────┐  │
│  │   Auth Layer  │      │   UI Layer     │      │   API Layer    │  │
│  │   (Existing)  │      │ (React + ShadCN)│      │ (Next.js API)  │  │
│  └───────┬───────┘      └────────┬───────┘      └────────┬───────┘  │
│          │                       │                       │          │
│          ▼                       ▼                       ▼          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     Data Access Layer                         │  │
│  │                  (Supabase Module + Hooks)                    │  │
│  └───────────────────────────────┬───────────────────────────────┘  │
│                                  │                                  │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │
                                   ▼
          ┌───────────────────────────────────────────────┐
          │               External Services                │
          │                                               │
          │  ┌─────────────────┐    ┌─────────────────┐   │
          │  │    Supabase     │    │     OpenAI      │   │
          │  │   (Database)    │    │      API        │   │
          │  └─────────────────┘    └─────────────────┘   │
          │                                               │
          └───────────────────────────────────────────────┘
```

## Module Structure

```
packages/supabase/src/module/
├── chats.ts                # Base CRUD operations for chats
├── chats.react.ts          # React hooks for chat operations
├── messages.ts             # Base CRUD operations for messages
├── messages.react.ts       # React hooks for message operations
├── chat-stream.ts          # OpenAI integration
└── chat-stream.react.ts    # React hooks for OpenAI streaming
```

## Component Interaction Flow

1. **Chat Creation Flow**

```
User -> UI Component -> useCreateChat() Hook -> createChat() -> Supabase -> Database -> UI Update
```

2. **Message Flow**

```
┌────────┐       ┌─────────────┐      ┌──────────────┐      ┌─────────┐      ┌───────────┐
│  User  │──1───▶│ Message UI  │──2──▶│ useChatStream│──3──▶│ OpenAI  │──4──▶│ Streaming │
└────────┘       └─────────────┘      └──────────────┘      └─────────┘      │ Response  │
                       ▲                      │                                └───────────┘
                       │                      │                                      │
                       │                      │                                      │
                       │                      ▼                                      │
                       │               ┌──────────────┐                             │
                       └───────6──────│ createMessage │◀────────────5───────────────┘
                                      └──────────────┘

1. User enters message and clicks send
2. UI calls streamMessage from useChatStream hook
3. API endpoint calls OpenAI
4. OpenAI streams response
5. Completed message saved to database via createMessage
6. UI updated with complete message
```

## Data Models

### Database Schema

```sql
-- Chats table
create table public.chats (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Messages table
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- User preferences table
create table public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  theme text not null default 'system',
  openai_settings jsonb default '{"preferred_model": "gpt-4o"}',
  notification_settings jsonb default '{"email_notifications": false, "push_notifications": false}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### TypeScript Interfaces

```typescript
// From database.types.ts after generation
export type Chat = Database["public"]["Tables"]["chats"]["Row"];
export type ChatInsert = Database["public"]["Tables"]["chats"]["Insert"];
export type ChatUpdate = Database["public"]["Tables"]["chats"]["Update"];
export type ChatList = Chat[];

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];
export type MessageList = Message[];

export type UserPreference =
  Database["public"]["Tables"]["user_preferences"]["Row"];
export type UserPreferenceInsert =
  Database["public"]["Tables"]["user_preferences"]["Insert"];
export type UserPreferenceUpdate =
  Database["public"]["Tables"]["user_preferences"]["Update"];
```

## Module Implementation Details

### Chat Module (chats.ts)

```typescript
export async function createChat({
  supabase,
  chat,
}: {
  supabase: SupabaseClient;
  chat: ChatInsert;
}): Promise<Chat> {
  try {
    const { data, error } = await supabase
      .from("chats")
      .insert(chat)
      .select("*")
      .single();

    if (error)
      throw new ChatOperationError(
        "createChat",
        "Failed to create chat",
        "Could not create chat",
        SupabaseErrorCode.INSERT_ERROR,
        error
      );

    return data;
  } catch (error) {
    // Error handling
  }
}

// Similar implementations for getChat, getChats, updateChat, deleteChat
```

### Chat React Hooks (chats.react.ts)

```typescript
export function useCreateChat({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<Chat, ChatOperationError, { chat: ChatInsert }>
  >;
}): UseMutationResult<Chat, ChatOperationError, { chat: ChatInsert }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chat }: { chat: ChatInsert }) => {
      return createChat({ supabase, chat });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      if (options.onSuccess) {
        options.onSuccess(data, { chat: data }, { chat: data });
      }
    },
    onError: (error, variables, context) => {
      moduleToast.error(error.toastMessage);
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
}

// Similar implementations for useChat, useChats, useUpdateChat, useDeleteChat
```

## API Routes

### Chat Route (apps/web/app/api/chat/route.ts)

```typescript
import { OpenAIStream, StreamingTextResponse } from "ai";
import { createClient } from "@/utils/supabase/server";
import { createMessage } from "@repo/supabase";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const supabase = await createClient();

    // Get user from session
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get OpenAI API key (from user preferences or environment)
    const apiKey = process.env.OPENAI_API_KEY;

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey });

    // Create chat completion with streaming
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    });

    // Save user message first
    const lastUserMessage = messages[messages.length - 1];
    await createMessage({
      supabase,
      message: {
        chat_id: chatId,
        role: lastUserMessage.role,
        content: lastUserMessage.content,
      },
    });

    // Convert to stream and save assistant message when complete
    const stream = OpenAIStream(response, {
      onCompletion: async (completion) => {
        await createMessage({
          supabase,
          message: {
            chat_id: chatId,
            role: "assistant",
            content: completion,
          },
        });
      },
    });

    // Return streaming response
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response("Error processing request", { status: 500 });
  }
}
```

## Security Considerations

1. **Authentication**

   - Leverage existing authentication system
   - All chat and user API endpoints must verify user authentication
   - API keys must be encrypted or stored securely

2. **Data Protection**

   - User chat data should be isolated by user ID
   - OpenAI API keys should be stored encrypted
   - Implement proper RLS (Row Level Security) in Supabase

3. **Rate Limiting**
   - Implement rate limiting on API endpoints
   - Add usage caps to prevent excessive API costs
   - Track token usage for billing purposes

## Performance Considerations

1. **Optimistic Updates**

   - Implement optimistic UI updates for immediate feedback
   - Cache chat lists and recent messages
   - Use TanStack Query for efficient data management

2. **Streaming**

   - Properly handle connection drops during streaming
   - Add retry logic for failed API calls
   - Implement UI feedback during streaming

3. **Pagination**
   - Implement pagination for chat history
   - Lazy load older messages
   - Use virtualization for long chat histories
