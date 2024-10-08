import { createClient } from "@/utils/supabase/server";
import { UserDropdown } from "@/components/UserDropdown";
import Dashboard from "@/components/dashboard/Dashboard";
import { StripeAccount } from "@/types/customTypes";

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
      user_id: account.user_id ?? "", // Handle null case
      name: `Account ${account.stripe_account_id.slice(-4)}`,
      icon: null,
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
        initialStripeAccounts={transformedStripeAccounts}
      />
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardPageAsync />;
}
