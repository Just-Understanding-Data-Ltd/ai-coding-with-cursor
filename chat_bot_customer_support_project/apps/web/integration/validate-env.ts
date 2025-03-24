/**
 * Validates required environment variables for integration tests
 * @throws Error if any required variables are missing or if attempting to use production environment
 */
export function validateEnvVars() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing required environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
    );
  }

  // Verify we're not using production
  if (supabaseUrl.includes("prod") || process.env.NODE_ENV === "production") {
    throw new Error(
      "Attempting to run integration tests against production environment! " +
        "Please use development credentials only."
    );
  }
}
