export interface Env {
  // Add your environment variables here
  NODE_ENV: string;
  PORT: string;
  SENTRY_DSN?: string;
  LOG_LEVEL?: string;
  // Add Supabase environment variables
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}
