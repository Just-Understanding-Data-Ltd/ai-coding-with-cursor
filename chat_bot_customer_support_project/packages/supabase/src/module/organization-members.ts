import { SupabaseOperationError, SupabaseErrorCode } from "../errors";
import { SupabaseClient } from "../index";
import { Database } from "../database.types";

/**
 * Represents an organization member.
 */
export type OrganizationMember =
  Database["public"]["Tables"]["organization_members"]["Row"];

/**
 * Represents the data required to insert a new organization member.
 */
export type OrganizationMemberInsert =
  Database["public"]["Tables"]["organization_members"]["Insert"];

/**
 * Represents the data required to update an existing organization member.
 */
export type OrganizationMemberUpdate =
  Database["public"]["Tables"]["organization_members"]["Update"];

/**
 * Custom error class for organization member operations.
 */
export class OrganizationMemberOperationError extends SupabaseOperationError {
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
 * Creates a new organization member.
 *
 * @param {object} params - The parameters for creating an organization member.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {OrganizationMemberInsert} params.member - The organization member data to insert.
 * @returns {Promise<OrganizationMember>} The created organization member.
 * @throws {OrganizationMemberOperationError} If the member creation fails.
 *
 * @example
 * ```typescript
 * const newMember = await createOrganizationMember({
 *   supabase,
 *   member: {
 *     organization_id: 'org-123',
 *     user_id: 'user-123',
 *     role_id: 'role-123',
 *     membership_type: 'team'
 *   }
 * });
 * ```
 */
export async function createOrganizationMember({
  supabase,
  member,
}: {
  supabase: SupabaseClient;
  member: OrganizationMemberInsert;
}): Promise<OrganizationMember> {
  try {
    const { data, error } = await supabase
      .from("organization_members")
      .insert(member)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned after insert");
    return data;
  } catch (error) {
    throw new OrganizationMemberOperationError(
      "Create Organization Member",
      "Failed to create organization member",
      "Unable to create organization member. Please try again.",
      SupabaseErrorCode.CREATE_FAILED,
      error
    );
  }
}

/**
 * Retrieves a single organization member by ID.
 *
 * @param {object} params - The parameters for retrieving an organization member.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.memberId - The ID of the organization member to retrieve.
 * @returns {Promise<OrganizationMember | null>} The organization member if found, null otherwise.
 * @throws {OrganizationMemberOperationError} If the query fails.
 *
 * @example
 * ```typescript
 * const member = await getOrganizationMember({
 *   supabase,
 *   memberId: 'member-123'
 * });
 * ```
 */
export async function getOrganizationMember({
  supabase,
  memberId,
}: {
  supabase: SupabaseClient;
  memberId: string;
}): Promise<OrganizationMember | null> {
  try {
    const { data, error } = await supabase
      .from("organization_members")
      .select("*")
      .eq("id", memberId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new OrganizationMemberOperationError(
      "Get Organization Member",
      `Failed to retrieve organization member with ID: ${memberId}`,
      "Unable to load organization member details. Please refresh the page.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * Retrieves all members of an organization.
 *
 * @param {object} params - The parameters for retrieving organization members.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.organizationId - The ID of the organization.
 * @returns {Promise<OrganizationMember[]>} Array of organization members.
 * @throws {OrganizationMemberOperationError} If the query fails.
 *
 * @example
 * ```typescript
 * const members = await getOrganizationMembers({
 *   supabase,
 *   organizationId: 'org-123'
 * });
 * ```
 */
export async function getOrganizationMembers({
  supabase,
  organizationId,
}: {
  supabase: SupabaseClient;
  organizationId: string;
}): Promise<OrganizationMember[]> {
  try {
    const { data, error } = await supabase
      .from("organization_members")
      .select("*")
      .eq("organization_id", organizationId);

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw new OrganizationMemberOperationError(
      "Get Organization Members",
      `Failed to retrieve members for organization: ${organizationId}`,
      "Unable to load organization members. Please refresh the page.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * Updates an existing organization member.
 *
 * @param {object} params - The parameters for updating an organization member.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.memberId - The ID of the organization member to update.
 * @param {OrganizationMemberUpdate} params.member - The organization member data to update.
 * @returns {Promise<OrganizationMember>} The updated organization member.
 * @throws {OrganizationMemberOperationError} If the update fails.
 *
 * @example
 * ```typescript
 * const updatedMember = await updateOrganizationMember({
 *   supabase,
 *   memberId: 'member-123',
 *   member: {
 *     role_id: 'new-role-123'
 *   }
 * });
 * ```
 */
export async function updateOrganizationMember({
  supabase,
  memberId,
  member,
}: {
  supabase: SupabaseClient;
  memberId: string;
  member: OrganizationMemberUpdate;
}): Promise<OrganizationMember> {
  try {
    const { data, error } = await supabase
      .from("organization_members")
      .update(member)
      .eq("id", memberId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned after update");
    return data;
  } catch (error) {
    throw new OrganizationMemberOperationError(
      "Update Organization Member",
      `Failed to update organization member with ID: ${memberId}`,
      "Unable to update organization member. Please try again.",
      SupabaseErrorCode.UPDATE_FAILED,
      error
    );
  }
}

/**
 * Deletes an organization member.
 *
 * @param {object} params - The parameters for deleting an organization member.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.memberId - The ID of the organization member to delete.
 * @returns {Promise<void>}
 * @throws {OrganizationMemberOperationError} If the deletion fails.
 *
 * @example
 * ```typescript
 * await deleteOrganizationMember({
 *   supabase,
 *   memberId: 'member-123'
 * });
 * ```
 */
export async function deleteOrganizationMember({
  supabase,
  memberId,
}: {
  supabase: SupabaseClient;
  memberId: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;
  } catch (error) {
    throw new OrganizationMemberOperationError(
      "Delete Organization Member",
      `Failed to delete organization member with ID: ${memberId}`,
      "Unable to delete organization member. Please try again.",
      SupabaseErrorCode.DELETE_FAILED,
      error
    );
  }
}
