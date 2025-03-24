import { createAdminClient } from "@/utils/supabase/admin";
import { IntegrationUserScenarios } from "./types";
import { execSync } from "child_process";
import { validateEnvVars } from "./validate-env";
import path from "path";
import fs from "fs";

const TOKENS_FILE = path.join(__dirname, ".test-tokens.json");

// Move token management to separate functions
const writeTokens = (tokens: Record<string, string>) => {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
};

export const getTestTokens = (): Record<string, string> => {
  if (!fs.existsSync(TOKENS_FILE)) {
    throw new Error("Test tokens file not found. Did setup run successfully?");
  }
  return JSON.parse(fs.readFileSync(TOKENS_FILE, "utf-8"));
};

/**
 * Global setup for integration tests.
 * Resets the database and generates access tokens for all test scenarios.
 *
 * @throws Error if environment variables are missing
 * @throws Error if database reset fails
 */
export default async function setup() {
  console.log("Starting global setup...");

  // Validate environment variables
  validateEnvVars();

  try {
    // Initialize admin client
    const supabaseAdminClient = createAdminClient();

    // Load roles and permissions first
    console.log(
      "Cleaning the database and setting up roles and permissions..."
    );
    execSync(
      `cd ../../packages/supabase && psql "postgresql://postgres:postgres@localhost:54322/postgres" -c "
        SELECT * FROM reset_test_db();

        -- Clear existing data
        TRUNCATE role_permissions CASCADE;
        TRUNCATE permissions CASCADE;
        TRUNCATE roles CASCADE;
        TRUNCATE teams CASCADE;

        -- Insert roles
        INSERT INTO roles (name, description) VALUES
          ('admin', 'Full administrative access'),
          ('member', 'Regular member access');

        -- Insert permissions
        INSERT INTO permissions (name, description, action) VALUES
          -- Comment & DM Management
          ('View Comments & DMs', 'Ability to view comments and direct messages', 'view_comments_and_dms'::permission_action),
          ('Manage Comments & DMs', 'Ability to manage comments and direct messages', 'manage_comments_and_dms'::permission_action),
          
          -- Email Management
          ('Manage Email Inbox', 'Ability to manage email inbox', 'manage_email_inbox'::permission_action),
          
          -- Integration Management
          ('Manage Connected Pages', 'Ability to manage connected social media pages', 'manage_connected_pages'::permission_action),
          ('Manage Integrations', 'Ability to manage platform integrations', 'manage_integrations'::permission_action),
          
          -- Post Management
          ('Create Posts', 'Ability to create new posts', 'create_posts'::permission_action),
          ('Edit Posts', 'Ability to edit posts', 'edit_posts'::permission_action),
          ('Delete Posts', 'Ability to delete posts', 'delete_posts'::permission_action),
          ('View Posts', 'Ability to view posts', 'view_posts'::permission_action),
          ('Schedule Posts', 'Ability to schedule posts', 'schedule_posts'::permission_action),
          
          -- Media Management
          ('Upload Media', 'Ability to upload media files', 'upload_media'::permission_action),
          ('Manage Media Library', 'Ability to manage media library', 'manage_media_library'::permission_action),
          
          -- Analytics
          ('View Analytics', 'Ability to view analytics', 'view_analytics'::permission_action),
          ('Export Analytics', 'Ability to export analytics data', 'export_analytics'::permission_action),
          
          -- Team Management
          ('Manage Team Members', 'Ability to manage team members', 'manage_team_members'::permission_action),
          ('Assign Roles', 'Ability to assign roles to team members', 'assign_roles'::permission_action),
          
          -- Admin Actions
          ('Manage Organization', 'Full organization management privileges', 'manage_organization'::permission_action),
          ('Manage Organization Members', 'Ability to manage organization members', 'manage_organization_members'::permission_action),
          ('Manage Billing', 'Full billing management privileges', 'manage_billing'::permission_action);

        -- Link roles to permissions (admin gets all permissions)
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id
        FROM roles r
        CROSS JOIN permissions p
        WHERE r.name = 'admin';

        -- Link roles to permissions (member gets limited permissions)
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id
        FROM roles r
        CROSS JOIN permissions p
        WHERE r.name = 'member'
        AND p.action NOT IN (
          -- Team Management exclusions
          'manage_team_members',
          'assign_roles',
          
          -- Admin Actions exclusions
          'manage_organization',
          'manage_organization_members',
          'manage_billing'
        );
      "`,
      { stdio: "inherit" }
    );
    console.log("Roles and permissions set up");

    // Load seed files in order
    console.log("Loading seed files...");
    const seedsDir = path.join(
      __dirname,
      "../../../packages/supabase/supabase/seeds"
    );
    const seedFiles = fs
      .readdirSync(seedsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort((a, b) => {
        // Extract numbers from filenames and compare
        const numA = parseInt(a.split("_")[0]);
        const numB = parseInt(b.split("_")[0]);
        return numA - numB;
      });

    for (const seedFile of seedFiles) {
      console.log(`Executing seed file: ${seedFile}`);
      try {
        execSync(
          `cd ../../packages/supabase && psql "postgresql://postgres:postgres@localhost:54322/postgres" -f ./supabase/seeds/${seedFile}`,
          { stdio: "inherit" }
        );
      } catch (error) {
        console.error(`Error executing seed file ${seedFile}:`, error);
        throw error;
      }
    }
    console.log("Seed files loaded");

    // Prepare users for authentication
    const usersToAuth = Object.values(IntegrationUserScenarios).map(
      (scenario) => ({
        email: scenario.email,
        scenario: scenario.scenarioId,
      })
    );
    console.log("Users to authenticate:", usersToAuth);

    // Store tokens in a local object first
    const testTokens: Record<string, string> = {};

    // Authenticate each user and store their tokens
    console.log("Starting user authentication...");
    for (const { email, scenario } of usersToAuth) {
      console.log(`Authenticating ${email}...`);
      const { data, error } = await supabaseAdminClient.auth.signInWithPassword(
        {
          email,
          password: "password123",
        }
      );

      if (error) {
        console.error(`Failed to sign in user ${email}:`, error);
        continue;
      }

      if (data.session) {
        testTokens[scenario] = data.session.access_token;
        console.log(`Token set for ${email}`);
      }
    }

    // Validate that we have tokens for all scenarios
    const missingTokens = Object.values(IntegrationUserScenarios)
      .filter((scenario) => !testTokens[scenario.scenarioId])
      .map((scenario) => scenario.scenarioId);

    if (missingTokens.length > 0) {
      throw new Error(
        `Missing tokens for scenarios: ${missingTokens.join(", ")}`
      );
    }

    // Write tokens to file
    writeTokens(testTokens);
    console.log("Test tokens saved to file");
    console.log("Global setup complete");
  } catch (error) {
    // Clean up tokens file if setup fails
    if (fs.existsSync(TOKENS_FILE)) {
      fs.unlinkSync(TOKENS_FILE);
    }
    console.error("Error during setup:", error);
    throw error;
  }
}

/**
 * Global teardown for integration tests.
 * Cleans up any test resources.
 */
export async function globalTeardown() {
  console.log("Cleaning up test resources...");
  if (fs.existsSync(TOKENS_FILE)) {
    fs.unlinkSync(TOKENS_FILE);
  }
  console.log("Cleanup completed");
}
