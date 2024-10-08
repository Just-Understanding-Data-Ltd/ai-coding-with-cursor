import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PlanSelector } from "@/components/PlanSelector";
import { config } from "@/config";
import { UserStatus, SubscriptionStatus } from "@/types/auth";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select("is_subscribed, stripe_price_id")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user subscription status:", error);
    redirect(config.auth.loginUrl);
  }

  let subscriptionStatus: SubscriptionStatus = { type: "NotSubscribed" };
  if (userData.is_subscribed && userData.stripe_price_id) {
    subscriptionStatus = {
      type: "Subscribed",
      planId: userData.stripe_price_id,
    };
  }

  const userStatus: UserStatus = {
    auth: { type: "Authenticated", userId: user.id },
    subscription: subscriptionStatus,
  };

  if (userStatus.subscription.type === "Subscribed") {
    redirect(config.auth.dashboardUrl);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Plan</h1>
      <PlanSelector successUrl="/dashboard" userEmail={user.email} />
    </div>
  );
}
