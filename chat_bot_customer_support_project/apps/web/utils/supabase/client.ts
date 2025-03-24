import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@repo/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient<Database> {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
