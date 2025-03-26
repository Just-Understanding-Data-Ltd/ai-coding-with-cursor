import { vi } from "vitest";

// Create a centralized mock for all Next.js navigation hooks
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export const mockPathname = "/org/test-org-id/test-team-id";

export const mockParams = {
  orgId: "test-org-id",
  teamId: "test-team-id",
  chatId: "test-chat-id",
};

// Export mock hooks that return consistent mock values
export const useRouter = vi.fn().mockReturnValue(mockRouter);
export const usePathname = vi.fn().mockReturnValue(mockPathname);
export const useParams = vi.fn().mockReturnValue(mockParams);
