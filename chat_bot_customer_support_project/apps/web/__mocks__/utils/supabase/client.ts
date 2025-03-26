import { vi } from "vitest";

// Create a centralized mock for Supabase client
export const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  match: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  data: undefined as any,
  error: null,
};

// Mock the createClient function to return our mockSupabaseClient
export const createClient = vi.fn(() => mockSupabaseClient);
