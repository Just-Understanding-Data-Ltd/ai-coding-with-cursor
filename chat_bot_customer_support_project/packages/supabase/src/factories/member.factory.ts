import { createAdminClient } from "./utils";
import type { Database } from "../database.types";

type MembershipType = Database["public"]["Enums"]["membership_type"];

/**
 * Creates a member in both organization and team with the same role.
 *
 * @param {object} params - The parameters for creating a member
 * @param {string} params.organizationId - The organization ID
 * @param {string} params.teamId - The team ID
 * @param {string} params.userId - The user ID to add as a member
 * @param {boolean} [params.isAdmin] - Whether the user should be an admin (defaults to false)
 * @param {{ admin: { id: string }, member: { id: string } }} params.roles - Role IDs to use
 * @returns {Promise<{ organizationMember: { id: string }, teamMember: { id: string } }>} The created member IDs
 */
export async function createTestMember({
  organizationId,
  teamId,
  userId,
  isAdmin = false,
  membershipType = "team",
  roles,
}: {
  organizationId: string;
  teamId: string;
  userId: string;
  isAdmin?: boolean;
  membershipType?: MembershipType;
  roles: { admin: { id: string }; member: { id: string } };
}): Promise<{
  organizationMember: { id: string };
  teamMember: { id: string };
}> {
  const adminClient = createAdminClient();

  // Check if organization member already exists
  const { data: existingOrgMember } = await adminClient
    .from("organization_members")
    .select()
    .match({ organization_id: organizationId, user_id: userId })
    .single();

  // Create organization member if it doesn't exist
  const { data: orgMember, error: orgMemberError } = !existingOrgMember
    ? await adminClient
        .from("organization_members")
        .insert({
          organization_id: organizationId,
          user_id: userId,
          role_id: isAdmin ? roles.admin.id : roles.member.id,
          membership_type: membershipType,
        })
        .select()
        .single()
    : { data: existingOrgMember, error: null };

  if (orgMemberError) throw orgMemberError;
  if (!orgMember) throw new Error("No organization member data returned");

  // Check if team member already exists
  const { data: existingTeamMember } = await adminClient
    .from("team_members")
    .select()
    .match({ team_id: teamId, user_id: userId })
    .single();

  // Create team member if it doesn't exist
  const { data: teamMember, error: teamMemberError } = !existingTeamMember
    ? await adminClient
        .from("team_members")
        .insert({
          team_id: teamId,
          user_id: userId,
          role_id: isAdmin ? roles.admin.id : roles.member.id,
        })
        .select()
        .single()
    : { data: existingTeamMember, error: null };

  if (teamMemberError) throw teamMemberError;
  if (!teamMember) throw new Error("No team member data returned");

  return {
    organizationMember: { id: orgMember.id },
    teamMember: { id: teamMember.id },
  };
}

/**
 * Creates multiple members in both organization and team with the same roles.
 *
 * @param {object} params - The parameters for creating members
 * @param {string} params.organizationId - The organization ID
 * @param {string} params.teamId - The team ID
 * @param {Array<{ userId: string; isAdmin?: boolean }>} params.members - Array of member details
 * @param {{ admin: { id: string }, member: { id: string } }} params.roles - Role IDs to use
 * @returns {Promise<Array<{ organizationMember: { id: string }, teamMember: { id: string } }>>} Array of created member IDs
 */
export async function createTestMembers({
  organizationId,
  teamId,
  members,
  roles,
}: {
  organizationId: string;
  teamId: string;
  members: Array<{ userId: string; isAdmin?: boolean }>;
  roles: { admin: { id: string }; member: { id: string } };
}): Promise<
  Array<{ organizationMember: { id: string }; teamMember: { id: string } }>
> {
  return Promise.all(
    members.map((member) =>
      createTestMember({
        organizationId,
        teamId,
        userId: member.userId,
        isAdmin: member.isAdmin,
        roles,
      })
    )
  );
}
