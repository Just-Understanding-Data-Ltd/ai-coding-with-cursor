import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  createTestUser,
  createTestOrganization,
  createTestMember,
} from "@repo/supabase";
import { createAuthenticatedClient } from "../test-utils";

// Helper to generate unique email
const getUniqueEmail = (prefix: string) =>
  `${prefix}.${Date.now()}.${Math.random().toString(36).substring(2)}@example.com`;

describe("User Authentication Integration Tests", () => {
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  describe("Team Admin User", () => {
    it("should be able to get user session with valid token", async () => {
      const email = getUniqueEmail("admin.session");
      // Create a test user with unique email
      const { user, token } = await createTestUser({ email });

      // Create an organization and make the user an admin
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

      // Get the user session using the token
      const {
        data: { user: sessionUser },
        error,
      } = await supabase.auth.getUser(token);

      // Verify no error occurred
      expect(error).toBeNull();

      // Verify user data
      expect(sessionUser).toBeTruthy();
      expect(sessionUser?.email).toBe(email);
    });

    it("should have admin permissions in the database", async () => {
      const email = getUniqueEmail("admin.permissions");
      // Create a test user with unique email
      const { user, token } = await createTestUser({ email });

      // Create an organization and make the user an admin
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

      const authenticatedClient = createAuthenticatedClient(token);

      // Query the database for the user's role
      const { data: roleData, error: roleError } = await authenticatedClient
        .from("organization_members")
        .select(
          `
          membership_type,
          roles (
            name
          )
        `
        )
        .eq("user_id", user.id)
        .single();

      // Verify no error occurred
      expect(roleError).toBeNull();

      // Verify role data
      expect(roleData).toBeTruthy();
      expect(roleData?.roles).toBeTruthy();
      if (roleData && roleData.roles) {
        expect(roleData.roles.name).toBe("admin");
        expect(roleData.membership_type).toBe("team");
      }
    });
  });

  describe("Team Member User", () => {
    it("should be able to get user session with valid token", async () => {
      const email = getUniqueEmail("member.session");
      // Create a test user with unique email
      const { user, token } = await createTestUser({ email });

      // Create an organization
      const { organization, team, roles } = await createTestOrganization({
        userId: user.id,
        asAdmin: false,
      });

      // Create the member with regular member role
      await createTestMember({
        organizationId: organization.id,
        teamId: team.id,
        userId: user.id,
        isAdmin: false,
        roles,
      });

      // Get the user session using the token
      const {
        data: { user: sessionUser },
        error,
      } = await supabase.auth.getUser(token);

      // Verify no error occurred
      expect(error).toBeNull();

      // Verify user data
      expect(sessionUser).toBeTruthy();
      expect(sessionUser?.email).toBe(email);
    });

    it("should have member permissions in the database", async () => {
      const email = getUniqueEmail("member.permissions");
      // Create a test user with unique email
      const { user, token } = await createTestUser({ email });

      // Create an organization
      const { organization, team, roles } = await createTestOrganization({
        userId: user.id,
        asAdmin: false,
      });

      // Create the member with regular member role
      await createTestMember({
        organizationId: organization.id,
        teamId: team.id,
        userId: user.id,
        isAdmin: false,
        roles,
      });

      const authenticatedClient = createAuthenticatedClient(token);

      // Query the database for the user's role
      const { data: roleData, error: roleError } = await authenticatedClient
        .from("organization_members")
        .select(
          `
          membership_type,
          roles (
            name
          )
        `
        )
        .eq("user_id", user.id)
        .single();

      // Verify no error occurred
      expect(roleError).toBeNull();

      // Verify role data
      expect(roleData).toBeTruthy();
      expect(roleData?.roles).toBeTruthy();
      if (roleData && roleData.roles) {
        expect(roleData.roles.name).toBe("member");
        expect(roleData.membership_type).toBe("team");
      }
    });
  });
});
