// https://www.bekapod.dev/articles/supabase-magic-login-testing-with-playwright/
import { type FullConfig } from "@playwright/test";
import { setupUserState } from "./supabase-helpers";
import { execSync } from "child_process";
import path from "path";

/**
 * Defines the different test user states and scenarios for E2E testing.
 * Each state represents a specific user role or condition in the application.
 * @enum {string}
 */
export enum TestSetup {
  // Basic states
  LoggedOutUser = "logged-out-user",

  // Multi-Team Organization States
  MultiTeamOrgAdmin = "multi-team-org-admin", // Admin in org with Marketing, Design, Development teams
  MultiTeamOrgMember = "multi-team-org-member", // Regular member in multi-team org
  MultiTeamOrgMixedRoles = "multi-team-org-mixed-roles", // Mixed roles across different teams

  // No-Teams Organization States
  NoTeamsOrgAdmin = "no-teams-org-admin", // Admin in organization without teams

  // Client Organization States
  ClientOrgAdmin = "client-org-admin", // Client organization admin
  ClientOrgMember = "client-org-member", // Client organization member
  ClientOrgInternalAdmin = "client-org-internal-admin", // Internal admin managing client org
  ClientOrgInternalMember = "client-org-internal-member", // Internal member managing client org

  // Special States
  NewUserOnboarding = "new-user-onboarding", // Fresh user for testing onboarding
  PendingInvitedUser = "pending-invited-user", // User with pending invitation
  ExpiredInvitation = "expired-invitation",
  ValidNewUserInvitation = "valid-new-user-invitation",
  ValidExistingUserInvitation = "valid-existing-user-invitation",
  ValidNewUserExistingSignInInvitation = "valid-new-user-existingsignin-invitation",
  InternalMember = "internal-member",
}

/**
 * Represents a test scenario configuration.
 * @interface
 */
interface TestScenario {
  /** The email address associated with this test scenario */
  email: string;
  /** Whether this scenario requires authentication */
  shouldLogin: boolean;
  /** Human-readable description of the test scenario */
  description: string;
}

/**
 * Maps test scenarios to their corresponding configuration.
 * Used to manage different test states and their associated user accounts.
 *
 * @example
 * ```typescript
 * // Get configuration for a client admin
 * const clientAdminConfig = testEmailMap[TestSetup.ClientOrgAdmin];
 * ```
 */
export const testEmailMap: Record<TestSetup, TestScenario> = {
  // Multi-Team Organization States
  [TestSetup.MultiTeamOrgAdmin]: {
    email: "team.admin-no-members@example.com",
    shouldLogin: true,
    description:
      "Admin in organization with Marketing, Design, and Development teams",
  },
  [TestSetup.MultiTeamOrgMember]: {
    email: "team.member@example.com",
    shouldLogin: true,
    description: "Regular member in multi-team organization",
  },
  [TestSetup.MultiTeamOrgMixedRoles]: {
    email: "mixed.roles@example.com",
    shouldLogin: true,
    description:
      "User with mixed roles across different teams (member in one, admin in another)",
  },

  // Client Organization States
  [TestSetup.ClientOrgAdmin]: {
    email: "client.admin@example.com",
    shouldLogin: true,
    description: "Admin of client organization",
  },
  [TestSetup.ClientOrgMember]: {
    email: "client.member@example.com",
    shouldLogin: true,
    description: "Member of client organization",
  },
  [TestSetup.ClientOrgInternalAdmin]: {
    email: "internal.admin@example.com",
    shouldLogin: true,
    description: "Internal admin managing client organization",
  },
  [TestSetup.ClientOrgInternalMember]: {
    email: "internal.member@example.com",
    shouldLogin: true,
    description: "Internal member managing client organization",
  },

  // SPECIAL STATES

  // New User Onboarding
  [TestSetup.NewUserOnboarding]: {
    email: "onboarding.user@example.com",
    shouldLogin: true,
    description: "Fresh user for testing onboarding flow",
  },

  // Special States
  [TestSetup.PendingInvitedUser]: {
    email: "invited.user@example.com",
    shouldLogin: false,
    description: "User with pending invitation",
  },

  // No-Teams Organization States
  [TestSetup.NoTeamsOrgAdmin]: {
    email: "team.admin-no-members@example.com",
    shouldLogin: true,
    description: "Admin in organization with no teams",
  },

  [TestSetup.LoggedOutUser]: {
    email: "",
    shouldLogin: false,
    description: "User with no authentication",
  },

  [TestSetup.ExpiredInvitation]: {
    email: "expired@example.com",
    shouldLogin: false,
    description: "User with expired invitation",
  },

  [TestSetup.ValidNewUserInvitation]: {
    email: "new.user@example.com",
    shouldLogin: false,
    description: "New user with valid invitation",
  },

  [TestSetup.ValidExistingUserInvitation]: {
    email: "existing.user.team@example.com",
    shouldLogin: false,
    description: "Existing user with valid invitation (team membership)",
  },

  [TestSetup.ValidNewUserExistingSignInInvitation]: {
    email: "new.user.existingsignin@example.com",
    shouldLogin: false,
    description: "New user with valid invitation (existing sign in flow)",
  },

  [TestSetup.InternalMember]: {
    email: "internal.member@example.com",
    shouldLogin: true,
    description: "Legacy scenario requiring internal.member@example.com",
  },

  // END OF SPECIAL STATES
};

/**
 * Global setup function for Playwright tests.
 * Handles database reset and user state initialization for all test scenarios.
 *
 * This function:
 * 1. Resets the database to a clean state
 * 2. Sets up authentication states for all required test users
 * 3. Creates storage states for authenticated sessions
 *
 * @param config - Playwright's full configuration object
 * @throws {Error} If database reset or user state setup fails
 *
 * @example
 * ```typescript
 * // In playwright.config.ts
 * import globalSetup from './global-setup';
 *
 * export default defineConfig({
 *   globalSetup,
 *   // ... other config
 * });
 * ```
 */
async function globalSetup(config: FullConfig) {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      // Get the workspace root directory (3 levels up from e2e folder)
      const workspaceRoot = path.resolve(__dirname, "../../..");
      console.log("Resetting database from workspace root:", workspaceRoot);

      // Clean the database using turbo from the workspace root
      execSync("pnpm turbo db:reset", {
        cwd: workspaceRoot,
        stdio: "inherit", // This will show the output in the console
      });

      // Get unique emails to setup (excluding those that don't need login)
      const uniqueEmails = [
        ...new Set(
          Object.values(testEmailMap)
            .filter((scenario) => scenario.shouldLogin && scenario.email)
            .map((scenario) => scenario.email)
        ),
      ];

      console.log("Setting up storage states for emails:", uniqueEmails);

      // Setup state for each unique email in parallel
      await Promise.all(
        uniqueEmails.map((email) => setupUserState(config, email))
      );

      // If we get here, setup was successful
      return;
    } catch (error) {
      attempts++;
      console.error(
        `Error in global setup (attempt ${attempts}/${maxAttempts}):`,
        error
      );

      if (attempts === maxAttempts) {
        throw error;
      }

      // Wait 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

export default globalSetup;
