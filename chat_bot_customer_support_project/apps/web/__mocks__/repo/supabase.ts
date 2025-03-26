import { vi } from "vitest";

// Mock user and authentication data
const mockUser = { id: "test-user-id", email: "test@example.com" };
const mockSession = { access_token: "mock-access-token" };

// Mock functions from @repo/supabase
export const createTestUser = vi.fn().mockResolvedValue({
  user: mockUser,
  token: mockSession.access_token,
});

export const createTestOrganization = vi.fn().mockResolvedValue({
  organization: { id: "test-org-id" },
  team: { id: "test-team-id" },
});

export const createTestMember = vi.fn().mockResolvedValue({
  id: "test-member-id",
});

export const createChat = vi.fn().mockResolvedValue({
  id: "test-chat-id",
  team_id: "test-team-id",
  title: "Test Chat",
});

export const createMessage = vi.fn().mockResolvedValue({
  id: "test-message-id",
  chat_id: "test-chat-id",
  content: "Test message content",
});

// React hooks
export const useCreateChat = vi.fn().mockImplementation(() => ({
  mutate: vi.fn((data) => {
    return Promise.resolve({ id: "new-chat-id" });
  }),
  isPending: false,
}));

export const useDeleteChat = vi.fn().mockImplementation(() => ({
  mutate: vi.fn(),
  isPending: false,
}));

export const useUpdateChat = vi.fn().mockImplementation(() => ({
  mutate: vi.fn(),
}));

export const useChat = vi.fn().mockImplementation(() => ({
  data: { id: "test-chat-id", title: "Test Chat" },
  isLoading: false,
}));

export const getChat = vi.fn().mockImplementation(() => ({
  id: "test-chat-id",
  title: "Test Chat",
}));

export const getMessages = vi.fn().mockImplementation(() => [
  { id: "msg1", content: "Test user message", role: "user" },
  { id: "msg2", content: "Test assistant response", role: "assistant" },
]);
