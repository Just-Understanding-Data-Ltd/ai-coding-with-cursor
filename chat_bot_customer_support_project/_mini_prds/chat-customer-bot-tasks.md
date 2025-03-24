# Chat Customer Bot Implementation Tasks

This document breaks down the implementation tasks required to transform the boilerplate into a fully functional chat customer bot application. Authentication is already implemented in the existing codebase.

## Phase 1: Environment and Module Setup

- [x] Change the onboarding flow i.e. the OnboardingForm.tsx file, should basically be tailored to work with a chat based application. Also you will need to update the enums in the database to support this.

### 1.1 Dependencies Installation

- [ ] Install the Vercel AI SDK: `pnpm add ai openai` only install this within the apps/web directory
- [ ] Install ShadCN UI components
- [ ] Configure tsconfig.json for new packages
- [ ] Update package.json scripts as needed

### 1.2 Environment Variables

- [ ] Add OpenAI API key to environment variables
- [ ] Update .env.example
- [ ] Configure API key validation

### 1.3 Database Schema Setup

- [ ] Create `chats` table in Supabase
- [ ] Create `messages` table in Supabase
- [ ] Update database types generation

## Phase 2: Module Implementation

### 2.1 Chat Module

- [ ] Create `packages/supabase/src/module/chats.ts`
- [ ] Implement `createChat` function
- [ ] Implement `getChat` function
- [ ] Implement `getChats` function
- [ ] Implement `updateChat` function
- [ ] Implement `deleteChat` function
- [ ] Create appropriate error handling classes

### 2.2 Messages Module

- [ ] Create `packages/supabase/src/module/messages.ts`
- [ ] Implement `createMessage` function
- [ ] Implement `getMessages` function
- [ ] Implement error handling
- [ ] Add message sorting and pagination

### 2.3 React Hooks

- [ ] Create `packages/supabase/src/module/chats.react.ts`
- [ ] Implement `useChat`, `useChats` hooks
- [ ] Implement `useCreateChat`, `useUpdateChat`, `useDeleteChat` mutations
- [ ] Create `packages/supabase/src/module/messages.react.ts`
- [ ] Implement `useMessages` and `useCreateMessage` hooks

## Phase 3: API Routes

### 3.1 Chat API Routes

- [ ] Create `apps/web/app/api/chat/route.ts`
- [ ] Implement streaming handler using Vercel AI SDK
- [ ] Add authentication middleware
- [ ] Add rate limiting

### 3.2 Messages API Routes

- [ ] Create `apps/web/app/api/chat/[chatId]/messages/route.ts`
- [ ] Implement message history endpoint
- [ ] Add proper error handling

## Phase 4: Frontend Implementation

### 4.1 Chat Page Structure

- [ ] Create `apps/web/app/(application)/org/[orgId]/[teamId]/chat/page.tsx`
- [ ] Create `apps/web/app/(application)/org/[orgId]/[teamId]/chat/[chatId]/page.tsx`
- [ ] Add proper data prefetching and hydration

### 4.2 Chat Components

- [ ] Create `ChatList` component
- [ ] Create `NewChatButton` component
- [ ] Create `ChatWindow` component
- [ ] Create `ChatMessage` component
- [ ] Create `MessageInput` component
- [ ] Implement message styling (user vs. assistant)

### 4.3 Features Implementation

- [ ] Add chat rename functionality
- [ ] Add chat deletion with confirmation
- [ ] Add typing indicators during streaming
- [ ] Implement message history view with pagination
- [ ] Add empty state for new users

## Phase 5: AI Integration

### 5.1 OpenAI Streaming

- [ ] Set up OpenAI client configuration
- [ ] Implement streaming message handling
- [ ] Add retry logic for failed API calls
- [ ] Implement token counting and limits

### 5.2 User Experience

- [ ] Add loading states during interactions
- [ ] Implement optimistic UI updates
- [ ] Add error recovery mechanisms
- [ ] Create helpful error messages

## Phase 6: User Settings

### 6.1 Settings Interface

- [ ] Create settings page
- [ ] Add theme switching
- [ ] Implement OpenAI API key management
- [ ] Add model selection options

### 6.2 Preferences

- [ ] Save user preferences to database
- [ ] Implement preferences loading
- [ ] Add system prompt customization
- [ ] Create notification settings

## Phase 8: Testing

### 8.1 Unit Tests

- [ ] Write tests for module functions
- [ ] Test React hooks
- [ ] Test API routes
- [ ] Test UI components

### 8.2 Integration Tests

- [ ] Test chat creation and interaction flow
- [ ] Test error scenarios
- [ ] Test edge cases like long messages
- [ ] Test performance with many messages
