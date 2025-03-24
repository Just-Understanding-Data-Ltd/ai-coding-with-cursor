import { SupabaseOperationError, SupabaseErrorCode } from "../errors";
import { SupabaseClient } from "../index";
import { Database } from "../database.types";

/**
 * Represents a team member.
 */
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];

/**
 * Represents the data required to insert a new team member.
 */
export type TeamMemberInsert =
  Database["public"]["Tables"]["team_members"]["Insert"];

/**
 * Represents the data required to update an existing team member.
 */
export type TeamMemberUpdate =
  Database["public"]["Tables"]["team_members"]["Update"];

/**
 * Custom error class for team member operations.
 */
export class TeamMemberOperationError extends SupabaseOperationError {
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

/**
 * Creates a new team member.
 *
 * @param {object} params - The parameters for creating a team member.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {TeamMemberInsert} params.member - The team member data to insert.
 * @returns {Promise<TeamMember>} The created team member.
 * @throws {TeamMemberOperationError} If the member creation fails.
 *
 * @example
 * ```typescript
 * const newMember = await createTeamMember({
 *   supabase,
 *   member: {
 *     team_id: 'team-123',
 *     user_id: 'user-123',
 *     role_id: 'role-123'
 *   }
 * });
 * ```
 */
export async function createTeamMember({
  supabase,
  member,
}: {
  supabase: SupabaseClient;
  member: TeamMemberInsert;
}): Promise<TeamMember> {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .insert(member)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned after insert");
    return data;
  } catch (error) {
    throw new TeamMemberOperationError(
      "Create Team Member",
      "Failed to create team member",
      "Unable to create team member. Please try again.",
      SupabaseErrorCode.CREATE_FAILED,
      error
    );
  }
}

/**
 * Retrieves a single team member by ID.
 *
 * @param {object} params - The parameters for retrieving a team member.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.memberId - The ID of the team member to retrieve.
 * @returns {Promise<TeamMember | null>} The team member if found, null otherwise.
 * @throws {TeamMemberOperationError} If the query fails.
 *
 * @example
 * ```typescript
 * const member = await getTeamMember({
 *   supabase,
 *   memberId: 'member-123'
 * });
 * ```
 */
export async function getTeamMember({
  supabase,
  memberId,
}: {
  supabase: SupabaseClient;
  memberId: string;
}): Promise<TeamMember | null> {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("id", memberId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new TeamMemberOperationError(
      "Get Team Member",
      `Failed to retrieve team member with ID: ${memberId}`,
      "Unable to load team member details. Please refresh the page.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * Retrieves all members of a team.
 *
 * @param {object} params - The parameters for retrieving team members.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.teamId - The ID of the team.
 * @returns {Promise<TeamMember[]>} Array of team members.
 * @throws {TeamMemberOperationError} If the query fails.
 *
 * @example
 * ```typescript
 * const members = await getTeamMembers({
 *   supabase,
 *   teamId: 'team-123'
 * });
 * ```
 */
export async function getTeamMembers({
  supabase,
  teamId,
}: {
  supabase: SupabaseClient;
  teamId: string;
}): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId);

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw new TeamMemberOperationError(
      "Get Team Members",
      `Failed to retrieve members for team: ${teamId}`,
      "Unable to load team members. Please refresh the page.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * Updates an existing team member.
 *
 * @param {object} params - The parameters for updating a team member.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.memberId - The ID of the team member to update.
 * @param {TeamMemberUpdate} params.member - The team member data to update.
 * @returns {Promise<TeamMember>} The updated team member.
 * @throws {TeamMemberOperationError} If the update fails.
 *
 * @example
 * ```typescript
 * const updatedMember = await updateTeamMember({
 *   supabase,
 *   memberId: 'member-123',
 *   member: {
 *     role_id: 'new-role-123'
 *   }
 * });
 * ```
 */
export async function updateTeamMember({
  supabase,
  memberId,
  member,
}: {
  supabase: SupabaseClient;
  memberId: string;
  member: TeamMemberUpdate;
}): Promise<TeamMember> {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .update(member)
      .eq("id", memberId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned after update");
    return data;
  } catch (error) {
    throw new TeamMemberOperationError(
      "Update Team Member",
      `Failed to update team member with ID: ${memberId}`,
      "Unable to update team member. Please try again.",
      SupabaseErrorCode.UPDATE_FAILED,
      error
    );
  }
}

/**
 * Deletes a team member.
 *
 * @param {object} params - The parameters for deleting a team member.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.memberId - The ID of the team member to delete.
 * @returns {Promise<void>}
 * @throws {TeamMemberOperationError} If the deletion fails.
 *
 * @example
 * ```typescript
 * await deleteTeamMember({
 *   supabase,
 *   memberId: 'member-123'
 * });
 * ```
 */
export async function deleteTeamMember({
  supabase,
  memberId,
}: {
  supabase: SupabaseClient;
  memberId: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;
  } catch (error) {
    throw new TeamMemberOperationError(
      "Delete Team Member",
      `Failed to delete team member with ID: ${memberId}`,
      "Unable to delete team member. Please try again.",
      SupabaseErrorCode.DELETE_FAILED,
      error
    );
  }
}
