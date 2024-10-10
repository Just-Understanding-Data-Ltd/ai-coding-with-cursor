import { createClient } from "@/utils/supabase/server";
import { UserDropdown } from "@/components/UserDropdown";
import Dashboard from "@/components/dashboard/Dashboard";
import { StripeAccount as CustomStripeAccount } from "@/types/customTypes";

interface StripeAccount extends Omit<CustomStripeAccount, "user_id"> {
  user_id: string | null;
  name: string;
  icon: string | null;
}

async function DashboardPageAsync() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return null;
  }

  const { data: stripeAccounts } = await supabase
    .from("stripe_accounts")
    .select("*")
    .eq("user_id", user.id);

  // Transform the data to match the StripeAccount interface
  const transformedStripeAccounts: StripeAccount[] =
    stripeAccounts?.map((account) => ({
      ...account,
      encrypted_stripe_api_key: account.encrypted_stripe_api_key || "",
      name: "", // Add a default value for name
      icon: null, // Add a default value for icon
      user_id: account.user_id || null, // Allow null for user_id
    })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {user && <UserDropdown user={user} />}
      </div>
      <Dashboard
        userId={user.id}
        userEmail={user.email ?? ""}
        // @ts-expect-error: StripeAccount type is not fully defined
        initialStripeAccounts={transformedStripeAccounts}
      />
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardPageAsync />;
}
