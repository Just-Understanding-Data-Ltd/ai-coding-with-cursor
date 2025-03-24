import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const tokenHash = requestUrl.searchParams.get("token_hash");

  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();

  let user: null | User = null;

  try {
    // Handle password reset flow
    if (type === "recovery") {
      return NextResponse.redirect(new URL("/reset-password", request.url));
    }

    // Handle both PKCE and magic link flows
    if (code) {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError);
        throw exchangeError;
      }
    } else if (type === "magiclink" && tokenHash) {
      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "email",
      });
      if (otpError) {
        console.error("Error verifying OTP:", otpError);
        throw otpError;
      }
    }

    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error getting user:", userError);
      throw userError;
    }
    user = authUser;

    if (!user || !user.email) {
      console.error("No user or email found after auth flow");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Process any pending invitations for this user
    const { data: pendingInvitations, error: invitationError } =
      await supabaseAdmin
        .from("invitations")
        .select("token")
        .eq("email", user.email)
        .is("accepted_at", null);

    if (invitationError) {
      console.error("Error fetching pending invitations:", invitationError);
      throw invitationError;
    }

    // If there are pending invitations, process them
    if (pendingInvitations && pendingInvitations.length > 0) {
      for (const invitation of pendingInvitations) {
        await supabase.rpc("process_invitation", {
          p_token: invitation.token,
          p_user_id: user.id,
        });
      }
    }

    // Check organization membership for all users
    const { data: orgMember, error: orgError } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (orgError && orgError.code !== "PGRST116") {
      console.error("Error fetching organization membership:", orgError);
      throw orgError;
    }

    if (!orgMember) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Get the user's team membership for this organization
    const { data: teamMember, error: teamError } = await supabase
      .from("team_members")
      .select(
        `
        team_id,
        teams!inner (
          organization_id
        )
      `
      )
      .eq("user_id", user.id)
      .eq("teams.organization_id", orgMember.organization_id as string)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (teamError && teamError.code !== "PGRST116") {
      console.error("Error fetching team membership:", teamError);
      throw teamError;
    }

    // If we have both org and team membership
    if (teamMember) {
      return NextResponse.redirect(
        new URL(
          `/org/${orgMember.organization_id}/${teamMember.team_id}`,
          request.url
        )
      );
    }

    // If we only have org membership but no team
    return NextResponse.redirect(
      new URL(`/org/${orgMember.organization_id}/workspaces`, request.url)
    );
  } catch (error) {
    console.error("Error in auth callback:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
