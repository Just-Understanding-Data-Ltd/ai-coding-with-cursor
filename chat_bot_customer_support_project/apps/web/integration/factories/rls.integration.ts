import { describe, it, expect, beforeAll } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  createTestMember,
} from "@repo/supabase";
import { createAuthenticatedClient } from "../test-utils";
import { User } from "@supabase/supabase-js";

/**
 * This test suite verifies that Row Level Security (RLS) policies work correctly
 * with our factory functions, ensuring proper access control between users.
 */
describe("Row Level Security (RLS) Policies", () => {
  // These variables will be set in the beforeAll hook
  let adminUser: { user: User; token: string };
  let memberUser: { user: User; token: string };
  let nonMemberUser: { user: User; token: string };
  let organizationId: string;
  let teamId: string;

  // Setup test data once before all tests
  beforeAll(async () => {
    // Create three test users with different access levels
    [adminUser, memberUser, nonMemberUser] = await Promise.all([
      createTestUser(),
      createTestUser(),
      createTestUser(),
    ]);

    // Create an organization with the admin user
    const { organization, team, roles } = await createTestOrganization({
      userId: adminUser.user.id,
      name: "RLS Test Organization",
      asAdmin: true,
    });

    organizationId = organization.id;
    teamId = team.id;

    // Add the second user as a regular member to the organization and team
    await createTestMember({
      organizationId,
      teamId,
      userId: memberUser.user.id,
      isAdmin: false,
      roles,
    });

    // The third user is not added to the organization (non-member)
  });

  describe("Organization Access", () => {
    it("admin should be able to view organization details", async () => {
      const adminClient = createAuthenticatedClient(adminUser.token);

      const { data, error } = await adminClient
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(organizationId);
    });

    it("member should be able to view organization details", async () => {
      const memberClient = createAuthenticatedClient(memberUser.token);

      const { data, error } = await memberClient
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(organizationId);
    });

    it("non-member should not be able to view organization details", async () => {
      const nonMemberClient = createAuthenticatedClient(nonMemberUser.token);

      const { data, error } = await nonMemberClient
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();

      // Should get an error or no data due to RLS
      expect(data).toBeNull();
      expect(error).toBeDefined();
    });
  });

  describe("Team Access", () => {
    it("admin should be able to view team details", async () => {
      const adminClient = createAuthenticatedClient(adminUser.token);

      const { data, error } = await adminClient
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(teamId);
    });

    it("member should be able to view team details", async () => {
      const memberClient = createAuthenticatedClient(memberUser.token);

      const { data, error } = await memberClient
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(teamId);
    });

    it("non-member should not be able to view team details", async () => {
      const nonMemberClient = createAuthenticatedClient(nonMemberUser.token);

      const { data, error } = await nonMemberClient
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      // Should get an error or no data due to RLS
      expect(data).toBeNull();
      expect(error).toBeDefined();
    });
  });

  describe("Organization Members Access", () => {
    it("admin should be able to view all organization members", async () => {
      const adminClient = createAuthenticatedClient(adminUser.token);

      const { data, error } = await adminClient
        .from("organization_members")
        .select("*")
        .eq("organization_id", organizationId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(2); // Admin + Member
    });

    it("member should be able to view all organization members", async () => {
      const memberClient = createAuthenticatedClient(memberUser.token);

      const { data, error } = await memberClient
        .from("organization_members")
        .select("*")
        .eq("organization_id", organizationId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(2); // Admin + Member
    });

    it("non-member should not be able to view organization members", async () => {
      const nonMemberClient = createAuthenticatedClient(nonMemberUser.token);

      const { data, error } = await nonMemberClient
        .from("organization_members")
        .select("*")
        .eq("organization_id", organizationId);

      // Should get an empty array due to RLS
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe("Team Members Access", () => {
    it("admin should be able to view all team members", async () => {
      const adminClient = createAuthenticatedClient(adminUser.token);

      const { data, error } = await adminClient
        .from("team_members")
        .select("*")
        .eq("team_id", teamId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(2); // Admin + Member
    });

    it("member should be able to view all team members", async () => {
      const memberClient = createAuthenticatedClient(memberUser.token);

      const { data, error } = await memberClient
        .from("team_members")
        .select("*")
        .eq("team_id", teamId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBe(2); // Admin + Member
    });

    it("non-member should not be able to view team members", async () => {
      const nonMemberClient = createAuthenticatedClient(nonMemberUser.token);

      const { data, error } = await nonMemberClient
        .from("team_members")
        .select("*")
        .eq("team_id", teamId);

      // Should get an empty array due to RLS
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });
});
