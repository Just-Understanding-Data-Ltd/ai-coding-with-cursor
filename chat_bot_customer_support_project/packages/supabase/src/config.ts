import { config } from "dotenv";

// Load environment variables
config();

// Helper function to get required env var
const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.error(
      `Environment variable ${key} is missing. Available vars:`,
      Object.keys(process.env).filter(
        (k) =>
          k.includes("RESEND") || k.includes("SITE") || k.includes("SUPABASE")
      )
    );
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const ENV = {
  RESEND_API_KEY: getRequiredEnvVar("RESEND_API_KEY"),
  SITE_URL: getRequiredEnvVar("NEXT_PUBLIC_SITE_URL"),
  SUPABASE_URL: getRequiredEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY: getRequiredEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: getRequiredEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
} as const;

// Validate required environment variables
Object.entries(ENV).forEach(([key, value]) => {
  if (!value) {
    console.error(
      `Environment variable ${key} is missing. Available env vars:`,
      process.env
    );
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
