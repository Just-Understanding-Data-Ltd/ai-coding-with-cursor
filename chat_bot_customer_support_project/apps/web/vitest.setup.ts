import "@testing-library/jest-dom";
import { expect, afterEach, vi, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import "./__tests__/unit-test-mocks";

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Suppress specific React testing warnings
beforeAll(() => {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      /Warning: An update to.*inside a test was not wrapped in act/.test(
        args[0]
      ) ||
      /Warning: ReactDOM.render is no longer supported/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// Only mock browser APIs when in a browser environment
if (typeof window !== "undefined") {
  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

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

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    root: Element | Document | null = null;
    rootMargin: string = "0px";
    thresholds: ReadonlyArray<number> = [0];
    constructor(
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) {
      this.root = options?.root ?? null;
      this.rootMargin = options?.rootMargin ?? "0px";
      this.thresholds = options?.threshold ? [options.threshold].flat() : [0];
    }
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

// Cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
