import { vi } from "vitest";
import { IntegrationUserScenarioId } from "./types";
import {
  createAuthenticatedClient,
  getTokenForScenario,
} from "@/integration/test-utils";

/**
 * Mock both server and browser clients for a specific user scenario
 */
export function mockSupabaseClients(scenarioId: IntegrationUserScenarioId) {
  const token = getTokenForScenario(scenarioId);
  const client = createAuthenticatedClient(token);

  // Mock the server createClient
  // Mock the server createClient
  vi.mock("@/utils/supabase/server", () => ({
    createClient: vi.fn().mockImplementation(() => client),
  }));

  // Mock the client createClient
  vi.mock("@/utils/supabase/client", () => ({
    createClient: vi.fn().mockImplementation(() => client),
  }));
}

/**
 * Clear all mocks
 */
export function clearSupabaseMocks() {
  vi.clearAllMocks();
}
