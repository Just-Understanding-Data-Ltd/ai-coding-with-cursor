import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseOperationError, SupabaseErrorCode } from "../errors";
import { Role } from "../types/roles";

export interface RoleData {
  id: string;
  name: Role;
  description: string | null;
}

/**
 * Custom error class for role operations.
 */
export class RoleOperationError extends SupabaseOperationError {
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
 * Fetches all roles from the database.
 *
 * @param {object} params - Function parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @returns {Promise<RoleData[]>} Array of roles
 * @throws {RoleOperationError} If the query fails
 *
 * @example
 * ```typescript
 * const roles = await getRoles({ supabase });
 * console.log('Roles:', roles);
 * ```
 */
export async function getRoles({
  supabase,
}: {
  supabase: SupabaseClient;
}): Promise<RoleData[]> {
  try {
    const { data, error } = await supabase
      .from("roles")
      .select("id, name, description");

    if (error) {
      throw new RoleOperationError(
        "Get Roles",
        "Failed to fetch roles",
        "Unable to load roles. Please try again.",
        SupabaseErrorCode.READ_FAILED,
        error
      );
    }

    return data as RoleData[];
  } catch (error) {
    if (error instanceof RoleOperationError) {
      throw error;
    }
    throw new RoleOperationError(
      "Get Roles",
      "Failed to fetch roles",
      "Unable to load roles. Please try again.",
      SupabaseErrorCode.READ_FAILED,
      error
    );
  }
}

/**
 * Static query keys for server-side usage
 */
export const roleQueryKeys = {
  all: ["roles"],
  lists: ["roles", "list"],
} as const;
