import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/__tests__/test-utils";

// Import our components
import NewChatButton from "./NewChatButton";
import ChatClient from "./ChatClient";

// Mock Next.js modules
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
    }),
    usePathname: () => "/org/test-org-id/test-team-id",
    useParams: () => ({
      orgId: "test-org-id",
      teamId: "test-team-id",
      chatId: "test-chat-id",
    }),
  };
});

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  match: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  data: null,
  error: null,
};

vi.mock("@/utils/supabase/client", () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Directly mock the useCreateChat function
vi.mock("@repo/supabase", () => ({
  useCreateChat: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteChat: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useUpdateChat: () => ({
    mutate: vi.fn(),
  }),
  useChats: () => ({
    data: [],
    isLoading: false,
  }),
  useChat: () => ({
    data: { id: "test-chat-id", title: "Test Chat" },
    isLoading: false,
  }),
  useMessages: () => ({
    data: [
      { id: "msg1", content: "Test user message", role: "user" },
      { id: "msg2", content: "Test assistant response", role: "assistant" },
    ],
    isLoading: false,
  }),
  getChat: () => null, // This makes the loading state show
  getMessages: () => [],
}));

// Mock AI SDK
vi.mock("ai/react", () => ({
  useChat: vi.fn().mockReturnValue({
    messages: [
      { id: "ai1", role: "user", content: "Hello" },
      { id: "ai2", role: "assistant", content: "How can I help you?" },
    ],
    input: "",
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
    setMessages: vi.fn(),
    setInput: vi.fn(),
    status: "idle",
  }),
}));

// Create an empty dehydrated state for testing
const emptyDehydratedState = {
  mutations: [],
  queries: [],
};

describe("Chat Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("NewChatButton", () => {
    it("should render the new chat button correctly", async () => {
      renderWithProviders(
        <NewChatButton orgId="test-org-id" teamId="test-team-id" />
      );

      // Check for the button text and test ID
      expect(screen.getByText(/New Chat/i)).toBeInTheDocument();
      expect(screen.getByTestId("new-chat-button")).toBeInTheDocument();

      // Check for the plus icon
      const plusIcon = document.querySelector(".lucide-plus");
      expect(plusIcon).toBeInTheDocument();
    });
  });

  describe("ChatClient", () => {
    it("should render the chat interface loading state", async () => {
      const { container } = renderWithProviders(
        <ChatClient
          orgId="test-org-id"
          teamId="test-team-id"
          chatId="test-chat-id"
          dehydratedState={emptyDehydratedState}
        />
      );

      // Check for elements with animate-pulse class
      const animatedElements = container.querySelectorAll(".animate-pulse");
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });
});
