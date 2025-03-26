import { vi } from "vitest";

// Create a mock with proper structure for auth.getUser
const mockGetUser = vi.fn().mockResolvedValue({
  data: { user: null },
  error: null,
});

export const createClient = vi.fn().mockImplementation(() => ({
  auth: {
    getUser: mockGetUser,
  },
}));
