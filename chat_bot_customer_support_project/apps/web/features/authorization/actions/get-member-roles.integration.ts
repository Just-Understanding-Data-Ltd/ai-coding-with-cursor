import { describe, it, expect } from "vitest";
import { createTestUser, createTestOrganization } from "@repo/supabase";
import { createAuthenticatedClient } from "@/integration/test-utils";
import { getMemberRoles } from "./get-member-roles";

describe("getMemberRoles", () => {
  it("should fetch roles for a user in an organization", async () => {
    // Create test data
    const { user, token } = await createTestUser();

    // Create organization (this will automatically create the user as an admin member)
    const { organization, team } = await createTestOrganization({
      userId: user.id,
      name: "Test Organization",
      asAdmin: true,
    });

    // Create an authenticated client
    const supabase = createAuthenticatedClient(token);

    // Fetch member roles
    const result = await getMemberRoles({
      supabase,
      userId: user.id,
    });

    // Verify organization memberships
    expect(result.organizationMemberships).toHaveLength(1);
    expect(result.organizationMemberships[0]).toMatchObject({
      organization_id: organization.id,
      user_id: user.id,
      membership_type: "team",
      role: {
        name: "admin",
      },
    });

    // Verify team memberships
    expect(result.teamMemberships).toHaveLength(1);
    expect(result.teamMemberships[0]).toMatchObject({
      team_id: team.id,
      user_id: user.id,
      role: {
        name: "admin",
      },
    });
  });

  it("should handle users with no memberships", async () => {
    // Create test user with no memberships
    const { user, token } = await createTestUser();
    const supabase = createAuthenticatedClient(token);

    // Fetch member roles
    const result = await getMemberRoles({
      supabase,
      userId: user.id,
    });

    // Verify empty results
    expect(result.organizationMemberships).toHaveLength(0);
    expect(result.teamMemberships).toHaveLength(0);
  });

  it("should fetch roles for a user in multiple organizations", async () => {
    // Create test data
    const { user, token } = await createTestUser();

    // Create first organization (user will be admin)
    const { organization: org1, team: team1 } = await createTestOrganization({
      userId: user.id,
      name: "First Organization",
      asAdmin: true,
    });

    // Create second organization (user will be member)
    const { organization: org2, team: team2 } = await createTestOrganization({
      userId: user.id,
      name: "Second Organization",
      asAdmin: false,
    });

    // Create an authenticated client
    const supabase = createAuthenticatedClient(token);

    // Fetch member roles
    const result = await getMemberRoles({
      supabase,
      userId: user.id,
    });

    // Verify organization memberships
    expect(result.organizationMemberships).toHaveLength(2);
    expect(result.organizationMemberships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organization_id: org1.id,
          user_id: user.id,
          role: expect.objectContaining({ name: "admin" }),
        }),
        expect.objectContaining({
          organization_id: org2.id,
          user_id: user.id,
          role: expect.objectContaining({ name: "member" }),
        }),
      ])
    );

    // Verify team memberships
    expect(result.teamMemberships).toHaveLength(2);
    expect(result.teamMemberships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          team_id: team1.id,
          user_id: user.id,
          role: expect.objectContaining({ name: "admin" }),
        }),
        expect.objectContaining({
          team_id: team2.id,
          user_id: user.id,
          role: expect.objectContaining({ name: "member" }),
        }),
      ])
    );
  });

  it("should handle RLS policies correctly", async () => {
    // Create two users
    const { user: user1, token: token1 } = await createTestUser();
    const { user: user2, token: token2 } = await createTestUser();

    // Create organization with user1 as admin
    const { organization } = await createTestOrganization({
      userId: user1.id,
      name: "Test Organization",
      asAdmin: true,
    });

    // Create clients for both users
    const client1 = createAuthenticatedClient(token1);
    const client2 = createAuthenticatedClient(token2);

    // User1 (admin) should be able to see their roles
    const result1 = await getMemberRoles({
      supabase: client1,
      userId: user1.id,
    });
    expect(result1.organizationMemberships).toHaveLength(1);

    // User2 (not in org) should not see any roles
    const result2 = await getMemberRoles({
      supabase: client2,
      userId: user2.id,
    });
    expect(result2.organizationMemberships).toHaveLength(0);

    // User2 should not be able to see User1's roles
    const result3 = await getMemberRoles({
      supabase: client2,
      userId: user1.id,
    });

    expect(result3.organizationMemberships).toHaveLength(0);
  });
});
