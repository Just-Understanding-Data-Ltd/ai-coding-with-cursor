import { SupabaseClient } from "@repo/supabase";
import {
  OrganizationMember,
  TeamMember,
  MemberRolesResponse,
} from "@repo/supabase";
import { SupabaseOperationError, SupabaseErrorCode } from "@repo/supabase";

/**
 * Custom error class for member role operations.
 */
export class MemberRoleOperationError extends SupabaseOperationError {
  constructor(
    operation: string,
    context: string,
    toastMessage: string,
    errorCode: SupabaseErrorCode,
    cause?: unknown
  ) {
    super(operation, context, toastMessage, errorCode, cause);
  }
}

// Type guard to ensure member has required organization fields
function isValidOrgMember(member: any): member is OrganizationMember {
  return (
    member &&
    typeof member.id === "string" &&
    typeof member.organization_id === "string" &&
    typeof member.user_id === "string" &&
    typeof member.role_id === "string" &&
    (!member.roles ||
      (typeof member.roles.id === "string" &&
        typeof member.roles.name === "string" &&
        (!member.roles.role_permissions ||
          Array.isArray(member.roles.role_permissions))))
  );
}

// Type guard to ensure member has required team fields
function isValidTeamMember(member: any): member is TeamMember {
  return (
    member &&
    typeof member.id === "string" &&
    typeof member.team_id === "string" &&
    typeof member.user_id === "string" &&
    typeof member.role_id === "string" &&
    (!member.roles ||
      (typeof member.roles.id === "string" &&
        typeof member.roles.name === "string" &&
        (!member.roles.role_permissions ||
          Array.isArray(member.roles.role_permissions))))
  );
}

/**
 * Fetches all organization and team memberships for a user with their associated roles and permissions.
 * This is a compound query that fetches both organization and team memberships in parallel
 * for optimal performance.
 *
 * @param {object} params - The parameters for fetching member roles
 * @param {SupabaseClient} params.supabase - The Supabase client instance
 * @param {string} params.userId - The ID of the user to fetch roles for
 * @returns {Promise<MemberRolesResponse>} Object containing both organization and team memberships
 * @throws {MemberRoleOperationError} If the query fails
 *
 * @example
 * ```typescript
 * const roles = await getMemberRoles({
 *   supabase,
 *   userId: 'user-123'
 * });
 *
 * console.log('Organization Memberships:', roles.organizationMemberships);
 * console.log('Team Memberships:', roles.teamMemberships);
 * ```
 */
export async function getMemberRoles({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<MemberRolesResponse> {
  try {
    // Execute both queries in parallel for better performance
    const [orgMembersResponse, teamMembersResponse] = await Promise.all([
      // Fetch organization memberships with roles and their permissions
      supabase
        .from("organization_members")
        .select(
          `
          id,
          organization_id,
          user_id,
          role_id,
          membership_type,
          roles:roles (
            id,
            name,
            description,
            role_permissions:role_permissions (
              permission:permissions (
                id,
                name,
                description,
                action
              )
            )
          )
        `
        )
        .eq("user_id", userId),

      // Fetch team memberships with roles and their permissions
      supabase
        .from("team_members")
        .select(
          `
          id,
          team_id,
          user_id,
          role_id,
          roles:roles (
            id,
            name,
            description,
            role_permissions:role_permissions (
              permission:permissions (
                id,
                name,
                description,
                action
              )
            )
          ),
          teams (
            organization_id
          )
        `
        )
        .eq("user_id", userId),
    ]);

    // Handle any errors from either query
    if (orgMembersResponse.error || !orgMembersResponse.data) {
      throw new MemberRoleOperationError(
        "Get Organization Memberships",
        `Failed to fetch organization memberships for user: ${userId}`,
        "Unable to load organization roles. Please refresh the page.",
        SupabaseErrorCode.READ_FAILED,
        orgMembersResponse.error
      );
    }

    if (teamMembersResponse.error || !teamMembersResponse.data) {
      throw new MemberRoleOperationError(
        "Get Team Memberships",
        `Failed to fetch team memberships for user: ${userId}`,
        "Unable to load team roles. Please refresh the page.",
        SupabaseErrorCode.READ_FAILED,
        teamMembersResponse.error
      );
    }

    // Transform and validate organization memberships
    const organizationMemberships = orgMembersResponse.data
      .map((member: any) => ({
        id: member.id,
        organization_id: member.organization_id || "",
        user_id: member.user_id || "",
        role_id: member.role_id || "",
        membership_type: member.membership_type,
        role: member.roles
          ? {
              id: member.roles.id || "",
              name: member.roles.name || "",
              description: member.roles.description ?? null,
              permissions:
                member.roles.role_permissions?.map((rp: any) => ({
                  permission: rp.permission || {},
                })) ?? [],
            }
          : {
              id: "",
              name: "",
              description: null,
              permissions: [],
            },
      }))
      .filter(isValidOrgMember);

    // Transform and validate team memberships
    const teamMemberships = teamMembersResponse.data
      .map((member: any) => ({
        id: member.id,
        team_id: member.team_id || "",
        user_id: member.user_id || "",
        role_id: member.role_id || "",
        organization_id: member.teams?.organization_id || "",
        role: member.roles
          ? {
              id: member.roles.id || "",
              name: member.roles.name || "",
              description: member.roles.description ?? null,
              permissions:
                member.roles.role_permissions?.map((rp: any) => ({
                  permission: rp.permission || {},
                })) ?? [],
            }
          : {
              id: "",
              name: "",
              description: null,
              permissions: [],
            },
      }))
      .filter(isValidTeamMember);

    return {
      organizationMemberships,
      teamMemberships,
    };
  } catch (error) {
    if (error instanceof MemberRoleOperationError) {
      throw error;
    }
    throw new MemberRoleOperationError(
      "Get Member Roles",
      "Failed to fetch member roles",
      "Unable to load roles. Please refresh the page.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * React Query key factory for member roles queries
 */
export const memberRolesKeys = {
  all: ["memberRoles"] as const,
  user: (userId: string) => [...memberRolesKeys.all, "user", userId] as const,
};
