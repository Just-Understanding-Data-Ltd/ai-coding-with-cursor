import { SupabaseOperationError, SupabaseErrorCode } from "../errors";
import { SupabaseClient } from "../index";
import { Database } from "../database.types";

/**
 * Represents a team.
 */
export type Team = Database["public"]["Tables"]["teams"]["Row"];

/**
 * Represents the data required to insert a new team.
 */
export type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"];

/**
 * Represents the data required to update an existing team.
 */
export type TeamUpdate = Database["public"]["Tables"]["teams"]["Update"];

/**
 * Custom error class for team operations.
 */
export class TeamOperationError extends SupabaseOperationError {
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
 * Creates a new team in the database.
 *
 * @param {object} params - The parameters for creating a team.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {TeamInsert} params.team - The team data to insert.
 * @returns {Promise<Team>} The created team.
 * @throws {TeamOperationError} If the team creation fails.
 *
 * @example
 * ```typescript
 * const newTeam = await createTeam({
 *   supabase,
 *   team: {
 *     name: 'New Team',
 *     organization_id: 'org-123',
 *     // other fields...
 *   }
 * });
 * ```
 */
export async function createTeam({
  supabase,
  team,
}: {
  supabase: SupabaseClient;
  team: TeamInsert;
}): Promise<Team> {
  try {
    const { data, error } = await supabase
      .from("teams")
      .insert(team)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned after insert");
    return data;
  } catch (error) {
    throw new TeamOperationError(
      "Create Team",
      "Failed to create new team",
      "Unable to create team. Please try again.",
      SupabaseErrorCode.CREATE_FAILED,
      error
    );
  }
}

/**
 * Retrieves a single team by ID.
 *
 * @param {object} params - The parameters for retrieving a team.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.teamId - The ID of the team to retrieve.
 * @returns {Promise<Team | null>} The team if found, null otherwise.
 * @throws {TeamOperationError} If the query fails.
 *
 * @example
 * ```typescript
 * const team = await getTeam({
 *   supabase,
 *   teamId: 'team-123',
 * });
 * if (team) {
 *   console.log('Team:', team.name);
 * }
 * ```
 */
export async function getTeam({
  supabase,
  teamId,
}: {
  supabase: SupabaseClient;
  teamId: string;
}): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new TeamOperationError(
      "Get Team",
      `Failed to retrieve team with ID: ${teamId}`,
      "Unable to load team details. Please refresh the page.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * Retrieves all teams for an organization.
 *
 * @param {object} params - The parameters for retrieving teams.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.organizationId - The ID of the organization.
 * @returns {Promise<Team[]>} Array of teams.
 * @throws {TeamOperationError} If the query fails.
 *
 * @example
 * ```typescript
 * const teams = await getTeams({
 *   supabase,
 *   organizationId: 'org-123',
 * });
 * teams.forEach(team => {
 *   console.log('Team:', team.name);
 * });
 * ```
 */
export async function getTeams({
  supabase,
  organizationId,
}: {
  supabase: SupabaseClient;
  organizationId: string;
}): Promise<Team[]> {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("organization_id", organizationId);

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw new TeamOperationError(
      "Get Teams",
      `Failed to retrieve teams for organization: ${organizationId}`,
      "Unable to load teams. Please refresh the page.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * Updates an existing team by ID.
 *
 * @param {object} params - The parameters for updating a team.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.teamId - The ID of the team to update.
 * @param {TeamUpdate} params.team - The team data to update.
 * @returns {Promise<Team>} The updated team.
 * @throws {TeamOperationError} If the update fails.
 *
 * @example
 * ```typescript
 * const updatedTeam = await updateTeam({
 *   supabase,
 *   teamId: 'team-123',
 *   team: {
 *     name: 'Updated Team Name',
 *   },
 * });
 * ```
 */
export async function updateTeam({
  supabase,
  teamId,
  team,
}: {
  supabase: SupabaseClient;
  teamId: string;
  team: TeamUpdate;
}): Promise<Team> {
  try {
    const { data, error } = await supabase
      .from("teams")
      .update(team)
      .eq("id", teamId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned after update");
    return data;
  } catch (error) {
    throw new TeamOperationError(
      "Update Team",
      `Failed to update team with ID: ${teamId}`,
      "Unable to update team details. Please try again.",
      SupabaseErrorCode.UPDATE_FAILED,
      error
    );
  }
}

/**
 * Deletes a team by ID.
 *
 * @param {object} params - The parameters for deleting a team.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.teamId - The ID of the team to delete.
 * @returns {Promise<void>}
 * @throws {TeamOperationError} If the deletion fails.
 *
 * @example
 * ```typescript
 * await deleteTeam({
 *   supabase,
 *   teamId: 'team-123',
 * });
 * ```
 */
export async function deleteTeam({
  supabase,
  teamId,
}: {
  supabase: SupabaseClient;
  teamId: string;
}): Promise<void> {
  try {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) throw error;
  } catch (error) {
    throw new TeamOperationError(
      "Delete Team",
      `Failed to delete team with ID: ${teamId}`,
      "Unable to delete team. Please try again.",
      SupabaseErrorCode.DELETE_FAILED,
      error
    );
  }
}
