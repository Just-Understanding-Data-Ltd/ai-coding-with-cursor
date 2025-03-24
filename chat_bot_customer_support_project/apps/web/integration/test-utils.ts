import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  IntegrationUserScenarioId,
  IntegrationUserScenario,
  IntegrationUserScenarios,
} from "./types";
import { Database } from "@repo/supabase";
import { getTestTokens } from "./setup";

/**
 * Creates an authenticated Supabase client for a specific test scenario using a scenario ID.
 * This is the recommended way to create test clients as it handles token retrieval automatically.
 *
 * @example
 * ```ts
 * // Create a client for a team admin user
 * const adminClient = createAuthenticatedClientForScenario(IntegrationUserScenarioId.TeamAdmin);
 *
 * // Use the client to make authenticated requests
 * const { data, error } = await adminClient.from('teams').select('*');
 * ```
 *
 * @param scenarioId - The ID of the test scenario (e.g. IntegrationUserScenarioId.TeamAdmin)
 * @returns An authenticated Supabase client configured for the specified scenario
 * @throws Error if no token exists for the given scenario ID
 * @see getTokenForScenario for retrieving just the token
 */
export function createAuthenticatedClientForScenario(
  scenarioId: IntegrationUserScenarioId
): SupabaseClient<Database> {
  const token = getTokenForScenario(scenarioId);
  return createAuthenticatedClient(token);
}

/**
 * Creates an authenticated Supabase client using a JWT token.
 * Use this for testing RLS policies and authenticated endpoints.
 *
 * @param {string} token - The JWT token from createTestUser
 * @returns {SupabaseClient} A Supabase client authenticated as that user
 */
export function createAuthenticatedClient(
  token: string
): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

/**
 * Retrieves the JWT token for a specific test scenario.
 */
export function getTokenForScenario(scenarioId: string): string {
  const tokens = getTestTokens();
  const token = tokens[scenarioId];
  if (!token) {
    throw new Error(`No token found for scenario: ${scenarioId}`);
  }
  return token;
}

/**
 * Gets all available test scenarios
 * @returns Array of all integration user scenarios
 */
export function getAllScenarios(): IntegrationUserScenario[] {
  return Object.values(IntegrationUserScenarios);
}

/**
 * Gets all scenario IDs
 * @returns Array of all scenario IDs
 */
export function getAllScenarioIds(): IntegrationUserScenarioId[] {
  return Object.values(IntegrationUserScenarioId);
}

/**
 * Creates authenticated clients for all scenarios
 * @returns Record of scenario IDs to their authenticated clients
 */
export function createAllAuthenticatedClients(): Record<
  IntegrationUserScenarioId,
  SupabaseClient<Database>
> {
  const clients = getAllScenarioIds().reduce(
    (acc, scenarioId) => {
      acc[scenarioId] = createAuthenticatedClient(
        getTokenForScenario(scenarioId)
      );
      return acc;
    },
    {} as Record<IntegrationUserScenarioId, SupabaseClient<Database>>
  );

  return clients;
}
