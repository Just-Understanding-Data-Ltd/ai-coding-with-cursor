import { config } from "@/config";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  // Fetch the user's subscription status
  const { data: userData, error } = await supabase
    .from("users")
    .select("is_subscribed")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user subscription status:", error);
    // Handle the error appropriately, redirect to the login page
    redirect(config.auth.loginUrl);
  }

  if (!userData?.is_subscribed) {
    // If the user is not subscribed, redirect to the onboarding page
    redirect(config.auth.signInRedirectUrl);
  }

  return <>{children}</>;
}
