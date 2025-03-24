import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

import { redirect } from "next/navigation";
import { OnboardingForm } from "@/features/onboarding/components/OnboardingForm";

export const metadata: Metadata = {
  title: "Onboarding",
  robots: {
    index: false,
    follow: false,
  },
};

interface OnboardingData {
  user: any;
  hasMemberships: boolean;
  pendingInvitation?: {
    token: string;
  } | null;
}

/**
 * Fetch onboarding data from Supabase
 */
const fetchOnboardingData = async (): Promise<OnboardingData> => {
  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check if user is already in an organization
  const { data: memberships, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1);

  if (membershipError) {
    console.error("Error checking memberships:", membershipError);
  }

  // Check for pending invitations
  const { data: pendingInvitations } = await supabaseAdmin
    .from("invitations")
    .select("token")
    .eq("email", user.email!)
    .is("accepted_at", null)
    .limit(1);

  return {
    user,
    hasMemberships: Boolean(memberships && memberships.length > 0),
    pendingInvitation: pendingInvitations?.[0] || null,
  };
};

export default async function OnboardingFeaturePage() {
  const data = await fetchOnboardingData();
  return (
    <div className="container mx-auto py-10">
      <OnboardingForm user={data.user} />
    </div>
  );
}
