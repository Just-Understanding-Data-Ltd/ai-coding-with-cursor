import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { config } from "@/config";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const tokenHash = requestUrl.searchParams.get("token_hash");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  } else if (type === "magiclink" && tokenHash) {
    const supabase = createClient();
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${config.auth.siteUrl}/onboarding`);
}
