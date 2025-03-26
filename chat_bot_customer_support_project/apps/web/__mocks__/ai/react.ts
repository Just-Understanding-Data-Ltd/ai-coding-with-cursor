import { vi } from "vitest";

// Mock AI SDK hooks
export const useChat = vi.fn(() => ({
  messages: [],
  input: "",
  handleInputChange: vi.fn(),
  handleSubmit: vi.fn(),
  isLoading: false,
  setMessages: vi.fn(),
}));
