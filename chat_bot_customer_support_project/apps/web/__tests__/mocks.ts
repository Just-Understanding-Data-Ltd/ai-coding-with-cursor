import { vi } from "vitest";

// Mock environment variables needed by Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

// Mock Next.js navigation
const mockRedirectImpl = vi.hoisted(() =>
  vi.fn((url) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  })
);

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: "/",
  query: {},
};

vi.mock("next/navigation", () => ({
  redirect: mockRedirectImpl,
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useSelectedLayoutSegment: () => null,
  AppRouterContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
  AppRouter: () => null,
}));

export const mockRedirect = mockRedirectImpl;

// Mock Next.js headers
const mockCookieStore = {
  getAll: vi.fn().mockReturnValue([]),
  get: vi.fn().mockReturnValue(null),
  set: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: () => mockCookieStore,
}));

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn().mockImplementation((table) => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [] }),
      }),
    }),
  })),
};

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => mockSupabaseClient,
}));

vi.mock("@/utils/supabase/admin", () => ({
  createAdminClient: () => mockSupabaseClient,
}));

// Mock server module first
vi.mock("@/utils/supabase/server", () => ({
  createClient: () => mockSupabaseClient,
}));

// Mock Supabase SSR
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => mockSupabaseClient,
}));

// Clear all mocks
export const clearCommonMocks = () => {
  mockRedirect.mockClear();
  mockCookieStore.getAll.mockClear();
  mockCookieStore.get.mockClear();
  mockCookieStore.set.mockClear();
  mockSupabaseClient.auth.getUser.mockClear();
  mockSupabaseClient.from.mockClear();
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.prefetch.mockClear();
  mockRouter.back.mockClear();
  mockRouter.forward.mockClear();
  mockRouter.refresh.mockClear();
};
