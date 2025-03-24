import { faker } from "@faker-js/faker";
import { createAdminClient } from "./utils";
import { User } from "@supabase/supabase-js";

/**
 * Creates a single user with authentication.
 *
 * @param {object} [params] - The parameters for creating a user (optional)
 * @param {string} [params.email] - Optional email (will be generated if not provided)
 * @param {string} [params.password] - Optional password (defaults to 'password123')
 * @returns {Promise<{ user: User, token: string }>} The created user and auth token
 */
export async function createTestUser(params?: {
  email?: string;
  password?: string;
}): Promise<{ user: User; token: string }> {
  const email = params?.email ?? faker.internet.email();
  const password = params?.password ?? "password123";

  const adminClient = createAdminClient();
  const { data: authData, error: authError } = await adminClient.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("No user data returned after signup");

  return {
    user: authData.user,
    token: authData.session!.access_token,
  };
}

/**
 * Creates multiple users with authentication.
 *
 * @param {object} [params] - The parameters for creating users (optional)
 * @param {number} [params.count=1] - Number of users to create (defaults to 1)
 * @returns {Promise<Array<{ user: User, token: string }>>} Array of created users and their auth tokens
 */
export async function createTestUsers(params?: {
  count?: number;
}): Promise<Array<{ user: User; token: string }>> {
  const count = params?.count ?? 1;
  return Promise.all(Array.from({ length: count }, () => createTestUser()));
}

/**
 * Logs in a user.
 *
 * @param {object} params - The parameters for logging in
 * @param {string} params.email - User's email
 * @param {string} [params.password] - User's password (defaults to 'password123')
 * @returns {Promise<string>} The auth token
 */
export async function loginTestUser({
  email,
  password = "password123",
}: {
  email: string;
  password?: string;
}): Promise<string> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.session) throw new Error("No session returned after login");

  return data.session.access_token;
}

/**
 * Logs in multiple users.
 *
 * @param {object} params - The parameters for logging in users
 * @param {Array<{ email: string; password?: string }>} params.users - Array of user credentials
 * @returns {Promise<string[]>} Array of auth tokens
 */
export async function loginTestUsers({
  users,
}: {
  users: Array<{ email: string; password?: string }>;
}): Promise<string[]> {
  return Promise.all(
    users.map((user) =>
      loginTestUser({
        email: user.email,
        password: user.password,
      })
    )
  );
}
