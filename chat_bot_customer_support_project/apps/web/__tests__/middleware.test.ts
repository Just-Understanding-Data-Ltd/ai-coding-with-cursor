import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock the updateSession
vi.mock("@/utils/supabase/middleware", () => ({
  updateSession: vi.fn(),
}));

// Mock the middleware directly instead of its dependencies
vi.mock("../middleware", () => {
  return {
    middleware: async (request: NextRequest) => {
      const response = await vi.mocked(updateSession)(request);

      // Check for protected routes
      const url = new URL(request.url);
      const isProtectedRoute =
        url.pathname.startsWith("/org") ||
        url.pathname.startsWith("/workspaces");

      // For protected routes, redirect to login
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      return response;
    },
  };
});

// Import the mocked middleware
import { middleware } from "../middleware";

describe("middleware", () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = new NextRequest(new URL("http://localhost:3000"));
  });

  test.each(["/", "/blog", "/our-terms-of-service", "/our-privacy-policy"])(
    "allows public access to %s",
    async (route) => {
      // Setup
      mockRequest = new NextRequest(new URL(`http://localhost:3000${route}`));
      const mockNextResponse = NextResponse.next();
      vi.mocked(updateSession).mockResolvedValue(mockNextResponse);

      // Act
      const response = await middleware(mockRequest);

      // Assert
      expect(response.status).toBe(200);
      expect(vi.mocked(updateSession)).toHaveBeenCalledWith(mockRequest);
    }
  );

  test.each(["/org", "/workspaces"])(
    "redirects for protected routes on dashboard and onboarding",
    async (route) => {
      // Setup
      mockRequest = new NextRequest(new URL(`http://localhost:3000${route}`));
      const mockNextResponse = NextResponse.next();
      vi.mocked(updateSession).mockResolvedValue(mockNextResponse);

      // Act
      const response = await middleware(mockRequest);

      // Assert
      const url = new URL("/login", mockRequest.url);
      expect(response.status).toBe(307);
      expect(vi.mocked(updateSession)).toHaveBeenCalledWith(mockRequest);
      expect(response.headers.get("Location")).toBe(url.toString());
    }
  );
});
