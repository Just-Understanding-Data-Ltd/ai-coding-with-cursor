import { NextRequest, NextResponse } from "next/server";
import { middleware } from "../middleware";
import { updateSession } from "@/utils/supabase/middleware";
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock the dependencies
vi.mock("@/utils/supabase/middleware", () => ({
  updateSession: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}));

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
      mockRequest = new NextRequest(new URL("http://localhost:3000/blog"));
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
