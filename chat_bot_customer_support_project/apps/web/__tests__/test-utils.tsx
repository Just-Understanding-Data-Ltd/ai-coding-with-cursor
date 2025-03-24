import { act } from "react";
import { render } from "@testing-library/react";
import ClientSideProviders from "@/components/providers/ClientSideProviders";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
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
  return (
    <AppRouterContext.Provider value={mockRouter as any}>
      <ClientSideProviders>{children}</ClientSideProviders>
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
