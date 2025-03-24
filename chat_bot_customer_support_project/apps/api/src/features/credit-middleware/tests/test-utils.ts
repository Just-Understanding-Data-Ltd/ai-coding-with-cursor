import { vi } from "vitest";
import type { Response } from "express";

export function createMockResponse(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn(() => ({
        data: {
          user: {
            id: "test-user-id",
          },
        },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              credits: 100,
            },
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              credits: 99,
            },
          })),
        })),
      })),
    })),
    rpc: vi.fn((procedure: string) => {
      if (procedure === "get_user_credits") {
        return Promise.resolve({ data: { credits: 100 } });
      }
      return Promise.resolve(null);
    }),
  };
}
