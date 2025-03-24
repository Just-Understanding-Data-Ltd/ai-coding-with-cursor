import Dashboard from "@/components/dashboard/Dashboard";
import { dehydrate } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/react-query";
import { createClient } from "@/utils/supabase/server";
import { getUsers } from "@repo/supabase";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{
    orgId: string;
  }>;
}) {
  const queryClient = createQueryClient();
  const { orgId } = await params;
  const supabase = await createClient();
  await queryClient.prefetchQuery({
    queryKey: ["users", "list"],
    queryFn: () => getUsers({ supabase }),
  });

  const dehydratedState = dehydrate(queryClient);
  return <Dashboard dehydratedState={dehydratedState} />;
}
