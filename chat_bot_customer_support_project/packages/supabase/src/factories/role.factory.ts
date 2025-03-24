import { createAdminClient } from "./utils";

/**
 * Gets or creates test roles from the database.
 *
 * @returns {Promise<{ admin: { id: string }, member: { id: string } }>} The role IDs
 */
export async function createTestRoles(): Promise<{
  admin: { id: string };
  member: { id: string };
}> {
  // Create admin client for this operation
  const adminClient = createAdminClient();

  // Get admin role
  const { data: adminRole, error: adminError } = await adminClient
    .from("roles")
    .select()
    .eq("name", "admin")
    .single();

  if (adminError) throw adminError;
  if (!adminRole) throw new Error("Admin role not found in database");

  // Get member role
  const { data: memberRole, error: memberError } = await adminClient
    .from("roles")
    .select()
    .eq("name", "member")
    .single();

  if (memberError) throw memberError;
  if (!memberRole) throw new Error("Member role not found in database");

  return {
    admin: { id: adminRole.id },
    member: { id: memberRole.id },
  };
}
