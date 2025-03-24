/**
 * Dashboard Layout for all pages under /org/[orgId]/[teamId].
 *
 * Responsibilities:
 * 1. Do a quick confirmation that the user can access this org/team.
 * 2. Prefetch queries if needed (like user lists) before rendering.
 * 3. Trigger a redirect if something is obviously invalid (e.g., user has no membership).
 *
 * Example Usage:
 *   <DashboardLayout>
 *     <SomeChildComponent />
 *   </DashboardLayout>
 */

import React from "react";
import { redirect } from "next/navigation";
import DashboardSideBar from "@/components/providers/DashboardSideBarProvider";
import { createClient } from "@/utils/supabase/server";
import { createQueryClient } from "@/lib/react-query";
import { getMemberRoles } from "@/features/authorization/actions/get-member-roles";
import { getUsers } from "@repo/supabase";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string; teamId: string }>;
}) {
  const { orgId, teamId } = await params;
  const supabase = await createClient();
  const queryClient = createQueryClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user is actually in this org/team.
  // This is optional if your /org/page.tsx already redirects users to the correct org/team.
  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("organization_id", orgId)
    .eq("user_id", user?.id!)
    .limit(1)
    .single();

  if (!orgMember) {
    redirect("/org"); // fallback redirect
  }

  const { data: teamMember } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("team_id", teamId)
    .eq("user_id", user?.id!)
    .single();

  if (!teamMember) {
    redirect(`/org/${orgId}/workspaces`); // fallback to the org-level redirect
  }

  // Prefetch any queries needed for child pages
  await queryClient.prefetchQuery({
    queryKey: ["users", "list"],
    queryFn: () => getUsers({ supabase }),
  });
  const memberRoles = await getMemberRoles({ supabase, userId: user?.id! });

  // Minimal layout wrapper
  return (
    <DashboardSideBar orgId={orgId} role={memberRoles} user={user!}>
      <div className="mx-auto max-w-[1600px] px-4">{children}</div>
    </DashboardSideBar>
  );
}
