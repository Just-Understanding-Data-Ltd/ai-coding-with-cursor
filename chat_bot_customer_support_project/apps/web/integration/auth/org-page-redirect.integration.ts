import * as supabaseServer from "@/utils/supabase/server";
import { describe, it, expect, beforeEach, vi } from "vitest";
import OrgRedirectPage from "@/app/(application)/org/page";
import {
  createTestUser,
  createTestOrganization,
  createTestMember,
} from "@repo/supabase";
import { createAuthenticatedClient } from "../test-utils";
import { redirect } from "next/navigation";

// Helper to generate unique email
const getUniqueEmail = (prefix: string) =>
  `${prefix}.${Date.now()}.${Math.random().toString(36).substring(2)}@example.com`;

vi.mock("@/utils/supabase/server", () => {
  return {
    createClient: vi.fn(),
  };
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    // Simulate Next.js redirect error structure
    const error = new Error("NEXT_REDIRECT");
    // Next.js uses this format: "NEXT_REDIRECT;replace;/some-url"
    (error as any).digest = `NEXT_REDIRECT;replace;${url}`;
    throw error;
  }),
}));

describe("Organization Redirect Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Authenticated Users", () => {
    it("should redirect admin to their org page", async () => {
      // Create a test admin user with unique email
      const { user, token } = await createTestUser({
        email: getUniqueEmail("redirect.admin"),
      });

      // Create an organization with the user as admin
      const { organization, team, roles } = await createTestOrganization({
        userId: user.id,
      });

      // Create the member with admin role
      await createTestMember({
        organizationId: organization.id,
        teamId: team.id,
        userId: user.id,
        isAdmin: true,
        roles,
      });

      const client = createAuthenticatedClient(token);
      const mockCreateClient = vi.mocked(supabaseServer.createClient);
      mockCreateClient.mockResolvedValue(client);

      try {
        await OrgRedirectPage();
        throw new Error("Should have redirected");
      } catch (error) {
        const digest = (error as any).digest;
        const [_, __, redirectUrl] = digest.split(";");
        expect(redirectUrl).toMatch(`/org/${organization.id}/${team.id}`);
      }
    });

    it("should redirect member to their org page", async () => {
      // Create a test member user with unique email
      const { user, token } = await createTestUser({
        email: getUniqueEmail("redirect.member"),
      });

      // Create an organization
      const { organization, team, roles } = await createTestOrganization({
        userId: user.id,
      });

      // Create the member with regular member role
      await createTestMember({
        organizationId: organization.id,
        teamId: team.id,
        userId: user.id,
        isAdmin: false,
        roles,
      });

      const client = createAuthenticatedClient(token);
      const mockCreateClient = vi.mocked(supabaseServer.createClient);
      mockCreateClient.mockResolvedValue(client);

      try {
        await OrgRedirectPage();
        throw new Error("Should have redirected");
      } catch (error) {
        const digest = (error as any).digest;
        const [_, __, redirectUrl] = digest.split(";");
        expect(redirectUrl).toMatch(`/org/${organization.id}/${team.id}`);
      }
    });
  });

  it("should redirect unauthenticated user to login", async () => {
    // Create an unauthenticated client (no token)
    const serverClient = createAuthenticatedClient("");

    const mockCreateClient = vi.mocked(supabaseServer.createClient);
    mockCreateClient.mockResolvedValue(serverClient);

    try {
      await OrgRedirectPage();
      throw new Error("Should have redirected");
    } catch (error) {
      const digest = (error as any).digest;
      const [_, __, redirectUrl] = digest.split(";");
      expect(redirectUrl).toBe("/login");
    }
  });
});
