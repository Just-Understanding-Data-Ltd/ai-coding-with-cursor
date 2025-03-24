import { createAdminClient } from "@/utils/supabase/admin";
import InvitationErrorPage from "./error";
import { JoinForm } from "@/components/JoinForm";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const token: string | undefined = (await searchParams)?.token;
  if (!token) {
    return (
      <InvitationErrorPage
        title="Invalid invitation link"
        description="Missing token query parameter."
      />
    );
  }

  const supabase = await createAdminClient();
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select(
      `
      *,
      organizations (
        name
      )
    `
    )
    .eq("token", token)
    .is("accepted_at", null)
    .single();

  if (error || !invitation) {
    console.error("This is the invitationerror", error);
    return (
      <InvitationErrorPage
        title="Invalid invitation link"
        description="We were unable to find an invitation with the given token."
      />
    );
  }

  const now: number = Date.now();
  const expiresAt: number = new Date(invitation.expires_at).getTime();
  if (expiresAt < now) {
    return (
      <InvitationErrorPage
        title="Expired invitation link"
        description="The invitation token has expired."
      />
    );
  }

  return <JoinForm invitation={invitation} />;
}
