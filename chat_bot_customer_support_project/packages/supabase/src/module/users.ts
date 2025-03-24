import { SupabaseOperationError, SupabaseErrorCode } from "../errors";
import { SupabaseClient } from "../index";
import { Database } from "../database.types";

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type UserList = User[];

export class UserOperationError extends SupabaseOperationError {
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
 * Creates a new user in the database
 * @param {Object} params - The parameters for creating a user
 * @param {SupabaseClient} params.supabase - The Supabase client instance
 * @param {UserInsert} params.user - The user data to insert
 * @returns {Promise<User>} The created user
 * @throws {UserOperationError} If the user creation fails
 *
 * @example
 * ```typescript
 * const newUser = await createUser({
 *   supabase,
 *   user: {
 *     email: 'user@example.com',
 *     name: 'John Doe'
 *   }
 * });
 * ```
 */
export async function createUser({
  supabase,
  user,
}: {
  supabase: SupabaseClient;
  user: UserInsert;
}): Promise<User> {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned after insert");
    return data;
  } catch (error) {
    throw new UserOperationError(
      "Create user",
      "Failed to create new user",
      "Unable to create user. Please try again.",
      SupabaseErrorCode.CREATE_FAILED,
      error
    );
  }
}

/**
 * Retrieves a single user by ID
 * @param {Object} params - The parameters for retrieving a user
 * @param {SupabaseClient} params.supabase - The Supabase client instance
 * @param {string} params.userId - The ID of the user to retrieve
 * @returns {Promise<User | null>} The user if found, null otherwise
 * @throws {UserOperationError} If the query fails
 *
 * @example
 * ```typescript
 * const user = await getUser({
 *   supabase,
 *   userId: '123e4567-e89b-12d3-a456-426614174000'
 * });
 * if (user) {
 *   console.log('User found:', user.name);
 * }
 * ```
 */
export async function getUser({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new UserOperationError(
      "Get user",
      `Failed to retrieve user with ID: ${userId}`,
      "Unable to load user details. Please refresh the page.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * Retrieves all users from the database
 * @param {Object} params - The parameters for retrieving users
 * @param {SupabaseClient} params.supabase - The Supabase client instance
 * @returns {Promise<UserList>} Array of users
 * @throws {UserOperationError} If the query fails
 *
 * @example
 * ```typescript
 * const users = await getUsers({ supabase });
 * users.forEach(user => {
 *   console.log('User:', user.name);
 * });
 * ```
 */
export async function getUsers({
  supabase,
}: {
  supabase: SupabaseClient;
}): Promise<UserList> {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw new UserOperationError(
      "Get users",
      "Failed to retrieve users list",
      "Unable to load users. Please refresh the page.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * Updates a user by ID
 * @param {Object} params - The parameters for updating a user
 * @param {SupabaseClient} params.supabase - The Supabase client instance
 * @param {string} params.userId - The ID of the user to update
 * @param {UserUpdate} params.user - The user data to update
 * @returns {Promise<User>} The updated user
 * @throws {UserOperationError} If the update fails
 *
 * @example
 * ```typescript
 * const updatedUser = await updateUser({
 *   supabase,
 *   userId: '123e4567-e89b-12d3-a456-426614174000',
 *   user: {
 *     name: 'Updated Name'
 *   }
 * });
 * ```
 */
export async function updateUser({
  supabase,
  userId,
  user,
}: {
  supabase: SupabaseClient;
  userId: string;
  user: UserUpdate;
}): Promise<User> {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(user)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("No data returned after update");
    return data;
  } catch (error) {
    throw new UserOperationError(
      "Update user",
      `Failed to update user with ID: ${userId}`,
      "Unable to update user details. Please try again.",
      SupabaseErrorCode.UPDATE_FAILED,
      error
    );
  }
}

/**
 * Deletes a user by ID
 * @param {Object} params - The parameters for deleting a user
 * @param {SupabaseClient} params.supabase - The Supabase client instance
 * @param {string} params.userId - The ID of the user to delete
 * @returns {Promise<void>}
 * @throws {UserOperationError} If the deletion fails
 *
 * @example
 * ```typescript
 * await deleteUser({
 *   supabase,
 *   userId: '123e4567-e89b-12d3-a456-426614174000'
 * });
 * ```
 */
export async function deleteUser({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<void> {
  try {
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) throw error;
  } catch (error) {
    throw new UserOperationError(
      "Delete user",
      `Failed to delete user with ID: ${userId}`,
      "Unable to delete user. Please try again.",
      SupabaseErrorCode.DELETE_FAILED,
      error
    );
  }
}
