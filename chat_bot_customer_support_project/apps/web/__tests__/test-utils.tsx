import { act } from "react";
import { render } from "@testing-library/react";
import ClientSideProviders from "@/components/providers/ClientSideProviders";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { mockRouter } from "./mocks";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    themes: ["light", "dark", "system"],
  }),
}));

// Mock useSearchParams and usePathname for AnalyticsTracker
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation");
  return {
    ...actual,
    useRouter: () => mockRouter,
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  };
});

// Mock Supabase hooks
vi.mock("@repo/supabase", async () => {
  const actual = await vi.importActual("@repo/supabase");
  return {
    ...actual,
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
      isPending: false,
    }),
    useTeamMembers: () => ({
      data: [],
      isLoading: false,
      error: null,
    }),
    useRoles: () => ({
      data: [],
      isLoading: false,
      error: null,
    }),
    useInvitations: () => ({
      data: [],
      isLoading: false,
      error: null,
    }),
    useUpdateTeam: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
    useDeleteTeam: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
    useTeams: () => ({
      data: [],
      isLoading: false,
      error: null,
    }),
    useUpdateTeamMember: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
    useInviteMember: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
    useRevokeInvitation: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  };
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

function TestProviders({ children }: { children: React.ReactNode }) {
  // Use new QueryClient for each test to avoid shared state
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <AppRouterContext.Provider value={mockRouter as any}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppRouterContext.Provider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options = {}
): ReturnType<typeof render> {
  let renderResult: ReturnType<typeof render>;
  act(() => {
    renderResult = render(ui, {
      wrapper: TestProviders,
      ...options,
    });
  });
  return renderResult!;
}

// Re-export everything
export * from "@testing-library/react";
