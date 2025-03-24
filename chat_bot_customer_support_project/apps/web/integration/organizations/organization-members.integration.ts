import { describe, it, expect, beforeAll } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  createTestMembers,
} from "@repo/supabase";
import { createAuthenticatedClient } from "../test-utils";
import { User } from "@supabase/supabase-js";

describe("Organization Members RLS Policies", () => {
  // We'll create these in beforeAll and use them throughout the tests
  let adminUser: { user: User; token: string };
  let memberUser: { user: User; token: string };
  let nonMemberUser: { user: User; token: string };
  let organizationId: string;
  let teamId: string;
  let roles: { admin: { id: string }; member: { id: string } };

  // Create test data once before all tests
  beforeAll(async () => {
    // Create test users
    [adminUser, memberUser, nonMemberUser] = await Promise.all([
      createTestUser(),
      createTestUser(),
      createTestUser(),
    ]);

    // Create organization with admin user
    const result = await createTestOrganization({
      userId: adminUser.user.id,
      name: "Test Organization",
    });
    organizationId = result.organization.id;
    teamId = result.team.id;
    roles = result.roles;

    // Add member user to organization and team
    await createTestMembers({
      organizationId,
      teamId,
      members: [{ userId: memberUser.user.id, isAdmin: false }],
      roles,
    });
  });

  it("admin should be able to view all organization members", async () => {
    // Create authenticated client with admin token
    const adminClient = createAuthenticatedClient(adminUser.token);

    const { data, error } = await adminClient
      .from("organization_members")
      .select("*")
      .eq("organization_id", organizationId);

    expect(error).toBeNull();
    expect(data).toHaveLength(2); // Admin + Member
  });

  it("member should be able to view organization members", async () => {
    // Create authenticated client with member token
    const memberClient = createAuthenticatedClient(memberUser.token);

    const { data, error } = await memberClient
      .from("organization_members")
      .select("*")
      .eq("organization_id", organizationId);

    expect(error).toBeNull();
    expect(data).toHaveLength(2); // Should see both admin and themselves
  });

  it("non-member should not be able to view organization members", async () => {
    // Create authenticated client with non-member token
    const nonMemberClient = createAuthenticatedClient(nonMemberUser.token);

    const { data, error } = await nonMemberClient
      .from("organization_members")
      .select("*")
      .eq("organization_id", organizationId);

    // Verify non-member can't see organization members due to RLS
    expect(data).toHaveLength(0); // Should not see any members
    expect(error).toBeNull(); // No error, just empty result due to RLS
  });

  it("admin should be able to add new members", async () => {
    // Create authenticated client with admin token
    const adminClient = createAuthenticatedClient(adminUser.token);

    const { error } = await adminClient.from("organization_members").insert({
      organization_id: organizationId,
      user_id: nonMemberUser.user.id,
      role_id: roles.member.id,
      membership_type: "team",
    });

    expect(error).toBeNull();
  });

  it("regular member should not be able to add new members", async () => {
    // Create authenticated client with member token
    const memberClient = createAuthenticatedClient(memberUser.token);

    const { error } = await memberClient.from("organization_members").insert({
      organization_id: organizationId,
      user_id: nonMemberUser.user.id,
      role_id: roles.member.id,
      membership_type: "team",
    });

    expect(error).not.toBeNull(); // Should get permission denied error
  });
});
