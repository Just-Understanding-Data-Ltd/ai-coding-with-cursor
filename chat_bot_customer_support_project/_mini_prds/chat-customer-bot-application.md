# Chat Customer Bot Application PRD

## Overview

This document outlines the requirements for transforming the existing Supabase TDD boilerplate into a chat customer support bot application that utilizes OpenAI's capabilities. Users will be able to create chat sessions and interact with an AI assistant to get help with their questions. Authentication is already implemented in the existing codebase.

## User Stories

### Core Functionality

1. **Chat Management**

   - As a user, I want to view all my previous chat sessions
   - As a user, I want to create a new chat session
   - As a user, I want to rename my chat sessions for better organization
   - As a user, I want to delete chat sessions I no longer need

2. **Chat Interaction**

   - As a user, I want to send messages to the AI assistant
   - As a user, I want to receive helpful responses from the AI assistant
   - As a user, I want to see message history in a conversation view
   - As a user, I want to see typing indicators while the AI is generating a response

3. **User Settings**
   - As a user, I want to update my profile information
   - As a user, I want to customize my chat experience (theme, notifications)
   - As a user, I want to view and manage my OpenAI API settings

### Administrator Stories

1. **User Management**

   - As an admin, I want to view all users in the system
   - As an admin, I want to manage user permissions

2. **System Settings**
   - As an admin, I want to configure default AI settings
   - As an admin, I want to monitor system usage

## Technical Architecture

### Module Structure

Following the existing codebase pattern, the chat functionality will be implemented in the Supabase module:

```
packages/supabase/src/module/
├── chats.ts               # Base CRUD operations for chats
├── chats.react.ts         # React hooks for chat operations
├── messages.ts            # Base CRUD operations for messages
└── messages.react.ts      # React hooks for message operations
```

### Data Models

```typescript
// packages/supabase/src/module/chats.ts
export type Chat = Database["public"]["Tables"]["chats"]["Row"];
export type ChatInsert = Database["public"]["Tables"]["chats"]["Insert"];
export type ChatUpdate = Database["public"]["Tables"]["chats"]["Update"];
export type ChatList = Chat[];

// packages/supabase/src/module/messages.ts
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];
export type MessageList = Message[];
```

### CRUD Operations

Following the existing module pattern, we'll implement these functions:

```typescript
// chats.ts - Core operations
export async function createChat({
  supabase,
  chat,
}: {
  supabase: SupabaseClient;
  chat: ChatInsert;
}): Promise<Chat>;

export async function getChat({
  supabase,
  chatId,
}: {
  supabase: SupabaseClient;
  chatId: string;
}): Promise<Chat | null>;

export async function getChats({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<ChatList>;

export async function updateChat({
  supabase,
  chatId,
  chat,
}: {
  supabase: SupabaseClient;
  chatId: string;
  chat: ChatUpdate;
}): Promise<Chat>;

export async function deleteChat({
  supabase,
  chatId,
}: {
  supabase: SupabaseClient;
  chatId: string;
}): Promise<void>;

// messages.ts - Core operations
export async function createMessage({
  supabase,
  message,
}: {
  supabase: SupabaseClient;
  message: MessageInsert;
}): Promise<Message>;

export async function getMessages({
  supabase,
  chatId,
}: {
  supabase: SupabaseClient;
  chatId: string;
}): Promise<MessageList>;
```

### React Hooks

```typescript
// chats.react.ts - React hooks for UI integration
export function useChat({
  chatId,
  supabase,
  options = {},
}: {
  chatId: string;
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<Chat | null, ChatOperationError>>;
});

export function useChats({
  userId,
  supabase,
  options = {},
}: {
  userId: string;
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<ChatList, ChatOperationError>>;
});

export function useCreateChat({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<Chat, ChatOperationError, { chat: ChatInsert }>
  >;
});

export function useUpdateChat({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      Chat,
      ChatOperationError,
      { chatId: string; chat: ChatUpdate }
    >
  >;
});

export function useDeleteChat({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<void, ChatOperationError, { chatId: string }>
  >;
});

// messages.react.ts - React hooks
export function useMessages({
  chatId,
  supabase,
  options = {},
}: {
  chatId: string;
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<MessageList, MessageOperationError>>;
});

export function useCreateMessage({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      Message,
      MessageOperationError,
      { message: MessageInsert }
    >
  >;
});
```

### Frontend Component Structure

```
apps/web/app/(application)/org/[orgId]/[teamId]/chat/
├── page.tsx                 # Chat list page
└── [chatId]/
    └── page.tsx             # Individual chat page

apps/web/components/chat/
├── ChatList/
│   ├── ChatList.tsx
│   └── ChatList.test.tsx
├── ChatMessage/
│   ├── ChatMessage.tsx
│   └── ChatMessage.test.tsx
├── ChatWindow/
│   ├── ChatWindow.tsx
│   └── ChatWindow.test.tsx
├── MessageInput/
│   ├── MessageInput.tsx
│   └── MessageInput.test.tsx
└── NewChatButton/
    ├── NewChatButton.tsx
    └── NewChatButton.test.tsx
```

### API Routes

```
apps/web/app/api/
└── chat/
    ├── route.ts            # Main streaming handler
    └── [chatId]/
        └── messages/
            └── route.ts    # Message history endpoint
```

## Implementation Plan

1. **Database Schema Setup** (Week 1)

   - Create tables for chats and messages
   - Implement base CRUD operations in the module

2. **Module Implementation** (Week 1-2)

   - Implement `chats.ts` and `messages.ts` modules
   - Create React hooks in `*.react.ts` files
   - Add AI streaming functionality

3. **UI Components** (Week 2-3)

   - Implement chat interface components
   - Create message display and input components
   - Add chat management UI

4. **AI Integration** (Week 3)

   - Add OpenAI streaming with Vercel AI SDK
   - Implement message persistence
   - Add typing indicators

5. **Testing & Refinement** (Week 4)
   - Write unit and integration tests
   - Test cross-browser compatibility
   - Address performance optimizations

## Dependencies

1. Vercel AI SDK for handling AI streams
2. OpenAI Node.js client
3. ShadCN components for UI
4. Radix UI primitives
5. TanStack Query for data fetching (already in the project)
6. Supabase for database and authentication (already in the project)

## Success Metrics

- All test cases pass
- Chat interactions complete in under 2 seconds
- Message streaming works seamlessly
- Chat history persists correctly
- Error states are properly handled

## Next Steps

1. Set up the database schema for chats and messages
2. Implement the Supabase module functions
3. Create the React hooks for the UI
4. Integrate the OpenAI streaming functionality
5. Build the UI components with ShadCN and Radix
