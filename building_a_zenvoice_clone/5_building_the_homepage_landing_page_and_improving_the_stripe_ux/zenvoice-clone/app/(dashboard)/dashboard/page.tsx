import { createClient } from "@/utils/supabase/server";
import { UserDropdown } from "@/components/UserDropdown";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {user && <UserDropdown user={user} />}
      </div>
      {/* Add your dashboard content here */}
    </div>
  );
}
