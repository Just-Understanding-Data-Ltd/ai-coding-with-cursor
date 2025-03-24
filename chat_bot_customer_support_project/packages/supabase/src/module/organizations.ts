import { SupabaseOperationError, SupabaseErrorCode } from "../errors";
import { SupabaseClient } from "../index";
import { Database } from "../database.types";

/**
 * Represents an organization.
 */
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];

/**
 * Represents the data required to update an existing organization.
 */
export type OrganizationUpdate =
  Database["public"]["Tables"]["organizations"]["Update"];

/**
 * Represents the data required to create a new organization.
 */
export type OrganizationInsert =
  Database["public"]["Tables"]["organizations"]["Insert"];

/**
 * Custom error class for organization operations.
 */
export class OrganizationOperationError extends SupabaseOperationError {
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
 * Retrieves a single organization by ID.
 *
 * @param {object} params - The parameters for retrieving an organization.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.orgId - The ID of the organization to retrieve.
 * @returns {Promise<Organization | null>} The organization if found, null otherwise.
 * @throws {OrganizationOperationError} If the query fails.
 *
 * @example
 * ```typescript
 * const org = await getOrganization({
 *   supabase,
 *   orgId: 'org-123',
 * });
 * if (org) {
 *   console.log('Organization:', org.name);
 * }
 * ```
 */
export async function getOrganization({
  supabase,
  orgId,
}: {
  supabase: SupabaseClient;
  orgId: string;
}): Promise<Organization | null> {
  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new OrganizationOperationError(
      "Get Organization",
      `Failed to retrieve organization with ID: ${orgId}`,
      "Unable to load organization details. Please refresh the page.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * Retrieves all organizations for a user.
 *
 * @param {object} params - The parameters for retrieving organizations.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.userId - The ID of the user.
 * @returns {Promise<Organization[]>} Array of organizations.
 * @throws {OrganizationOperationError} If the query fails.
 *
 * @example
 * ```typescript
 * const orgs = await getOrganizations({
 *   supabase,
 *   userId: 'user-123',
 * });
 * orgs.forEach(org => {
 *   console.log('Organization:', org.name);
 * });
 * ```
 */
export async function getOrganizations({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<Organization[]> {
  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("*, organization_members!inner(*)")
      .eq("organization_members.user_id", userId);

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw new OrganizationOperationError(
      "Get Organizations",
      `Failed to retrieve organizations for user: ${userId}`,
      "Unable to load organizations. Please refresh the page.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * Creates a new organization.
 *
 * @param {object} params - The parameters for creating an organization.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {OrganizationInsert} params.organization - The organization data to insert.
 * @returns {Promise<Organization>} The created organization.
 * @throws {OrganizationOperationError} If the insertion fails.
 *
 * @example
 * ```typescript
 * const newOrg = await createOrganization({
 *   supabase,
 *   organization: {
 *     name: 'New Organization',
 *     // other required fields
 *   },
 * });
 * console.log('Created Organization:', newOrg.id);
 * ```
 */
export async function createOrganization({
  supabase,
  organization,
}: {
  supabase: SupabaseClient;
  organization: OrganizationInsert;
}): Promise<Organization> {
  try {
    const { data, error } = await supabase
      .from("organizations")
      .insert(organization)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned after insert");
    return data;
  } catch (error) {
    throw new OrganizationOperationError(
      "Create Organization",
      "Failed to create organization",
      "Unable to create organization. Please try again.",
      SupabaseErrorCode.CREATE_FAILED,
      error
    );
  }
}

/**
 * Updates an existing organization by ID.
 *
 * @param {object} params - The parameters for updating an organization.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.orgId - The ID of the organization to update.
 * @param {OrganizationUpdate} params.organization - The organization data to update.
 * @returns {Promise<Organization>} The updated organization.
 * @throws {OrganizationOperationError} If the update fails.
 *
 * @example
 * ```typescript
 * const updatedOrg = await updateOrganization({
 *   supabase,
 *   orgId: 'org-123',
 *   organization: {
 *     name: 'Updated Organization Name',
 *   },
 * });
 * ```
 */
export async function updateOrganization({
  supabase,
  orgId,
  organization,
}: {
  supabase: SupabaseClient;
  orgId: string;
  organization: OrganizationUpdate;
}): Promise<Organization> {
  try {
    const { data, error } = await supabase
      .from("organizations")
      .update(organization)
      .eq("id", orgId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned after update");
    return data;
  } catch (error) {
    throw new OrganizationOperationError(
      "Update Organization",
      `Failed to update organization with ID: ${orgId}`,
      "Unable to update organization details. Please try again.",
      SupabaseErrorCode.UPDATE_FAILED,
      error
    );
  }
}

/**
 * Deletes an organization by ID.
 *
 * @param {object} params - The parameters for deleting an organization.
 * @param {SupabaseClient} params.supabase - The Supabase client instance.
 * @param {string} params.orgId - The ID of the organization to delete.
 * @returns {Promise<void>}
 * @throws {OrganizationOperationError} If the deletion fails.
 *
 * @example
 * ```typescript
 * await deleteOrganization({
 *   supabase,
 *   orgId: 'org-123',
 * });
 * ```
 */
export async function deleteOrganization({
  supabase,
  orgId,
}: {
  supabase: SupabaseClient;
  orgId: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", orgId);

    if (error) throw error;
  } catch (error) {
    throw new OrganizationOperationError(
      "Delete Organization",
      `Failed to delete organization with ID: ${orgId}`,
      "Unable to delete organization. Please try again.",
      SupabaseErrorCode.DELETE_FAILED,
      error
    );
  }
}
