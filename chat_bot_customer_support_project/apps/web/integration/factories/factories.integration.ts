import { describe, it, expect, afterAll } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  createTestMember,
} from "@repo/supabase";
import { createAuthenticatedClient } from "../test-utils";
import { createAdminClient } from "@/utils/supabase/admin";

describe("Factory Functions", () => {
  // Store created resources for cleanup
  const createdResources = {
    userId: "",
    organizationId: "",
    teamId: "",
  };

  describe("User Factory", () => {
    it("should create a test user with authentication", async () => {
      // Create a test user
      const { user, token } = await createTestUser();

      // Store user ID for cleanup
      createdResources.userId = user.id;

      // Verify user exists and token works
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(token).toBeDefined();

      // Create an authenticated client with the token
      const client = createAuthenticatedClient(token);

      // Verify the client can access authenticated routes
      const { data: authUser, error: authError } = await client.auth.getUser();
      expect(authError).toBeNull();
      expect(authUser.user).toBeDefined();
      expect(authUser.user?.id).toBe(user.id);
    });
  });

  describe("Organization Factory", () => {
    it("should create an organization with a team and admin role", async () => {
      // Create a test user first
      const { user, token } = await createTestUser();

      // Create an organization with the user as admin
      const orgName = "Test Organization";
      const { organization, team, roles } = await createTestOrganization({
        userId: user.id,
        name: orgName,
        asAdmin: true,
      });

      // Store IDs for cleanup
      createdResources.organizationId = organization.id;
      createdResources.teamId = team.id;

      // Verify organization was created with ID
      expect(organization).toBeDefined();
      expect(organization.id).toBeDefined();

      // Verify team was created
      expect(team).toBeDefined();
      expect(team.id).toBeDefined();

      // Verify roles were assigned
      expect(roles).toBeDefined();
      expect(Object.keys(roles)).toHaveLength(2); // admin and member roles

      // Create an authenticated client and verify access
      const client = createAuthenticatedClient(token);

      // Verify the client can access the created organization
      const { data: orgData, error: orgError } = await client
        .from("organizations")
        .select("*")
        .eq("id", organization.id)
        .single();

      expect(orgError).toBeNull();
      expect(orgData).toBeDefined();
      expect(orgData?.id).toBe(organization.id);
      expect(orgData?.name).toBe(orgName);

      // Verify the client can access the created team
      const { data: teamData, error: teamError } = await client
        .from("teams")
        .select("*")
        .eq("id", team.id)
        .single();

      expect(teamError).toBeNull();
      expect(teamData).toBeDefined();
      expect(teamData?.id).toBe(team.id);
    });
  });

  describe("Permission and Role Relations", () => {
    it("should create a user with admin permissions and verify access", async () => {
      // Create a test user
      const { user, token } = await createTestUser();

      // Create an organization with the user as admin
      const { organization, team } = await createTestOrganization({
        userId: user.id,
        asAdmin: true,
      });

      // Create authenticated client
      const client = createAuthenticatedClient(token);

      // Verify admin can access organization settings
      const { data: orgMemberData, error: orgMemberError } = await client
        .from("organization_members")
        .select("*")
        .eq("user_id", user.id)
        .eq("organization_id", organization.id)
        .single();

      expect(orgMemberError).toBeNull();
      expect(orgMemberData).toBeDefined();

      // Verify the user can perform admin actions like viewing all members
      const { data: membersData, error: membersError } = await client
        .from("organization_members")
        .select("*")
        .eq("organization_id", organization.id);

      expect(membersError).toBeNull();
      expect(membersData).toBeDefined();
      expect(membersData?.length).toBeGreaterThan(0);
    });
  });

  describe("Team Member Factory", () => {
    it("should create team members with specific roles", async () => {
      // Create a test user for the admin
      const { user: adminUser, token: adminToken } = await createTestUser();

      // Create an organization with the admin user
      const { organization, team, roles } = await createTestOrganization({
        userId: adminUser.id,
        asAdmin: true,
      });

      // Create a test user for the team member
      const { user: memberUser, token: memberToken } = await createTestUser();

      // Create authenticated clients
      const adminClient = createAuthenticatedClient(adminToken);
      const memberClient = createAuthenticatedClient(memberToken);

      // Add the member to the organization and team as a regular member
      await createTestMember({
        organizationId: organization.id,
        teamId: team.id,
        userId: memberUser.id,
        isAdmin: false,
        roles,
      });

      // Verify the member can access the team
      const { data: memberTeamData, error: memberTeamError } =
        await memberClient.from("teams").select("*").eq("id", team.id).single();

      expect(memberTeamError).toBeNull();
      expect(memberTeamData).toBeDefined();
      expect(memberTeamData?.id).toBe(team.id);
    });
  });

  // Cleanup created resources after tests
  afterAll(async () => {
    try {
      const adminClient = createAdminClient();

      // Clean up in reverse order of creation
      if (createdResources.teamId) {
        await adminClient
          .from("team_members")
          .delete()
          .eq("team_id", createdResources.teamId);

        await adminClient
          .from("teams")
          .delete()
          .eq("id", createdResources.teamId);
      }

      if (createdResources.organizationId) {
        await adminClient
          .from("organization_members")
          .delete()
          .eq("organization_id", createdResources.organizationId);

        await adminClient
          .from("organizations")
          .delete()
          .eq("id", createdResources.organizationId);
      }

      if (createdResources.userId) {
        await adminClient.auth.admin.deleteUser(createdResources.userId);
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  });
});
