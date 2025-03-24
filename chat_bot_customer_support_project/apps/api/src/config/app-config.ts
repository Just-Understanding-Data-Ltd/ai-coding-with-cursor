import type { Env } from "../types/env";

export const getAppConfig = (): Env => {
  return {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || "8080",
    SENTRY_DSN: process.env.SENTRY_DSN,
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
};
