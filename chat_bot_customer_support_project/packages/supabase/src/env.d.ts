declare namespace NodeJS {
  interface ProcessEnv {
    RESEND_API_KEY: string;
    NEXT_PUBLIC_SITE_URL: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    // Add other environment variables as needed
  }
}
