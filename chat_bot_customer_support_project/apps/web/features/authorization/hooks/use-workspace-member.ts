"use client";

import { TeamMember } from "@repo/supabase";
import { useMemberRoles } from "./use-member-roles";
import { SupabaseClient } from "@repo/supabase";

interface UseWorkspaceMemberParams {
  userId: string;
  orgId: string;
  supabase: SupabaseClient;
}

export function useWorkspaceMember({
  userId,
  orgId,
  supabase,
}: UseWorkspaceMemberParams) {
  const { data: memberRoles, isLoading } = useMemberRoles({
    userId,
    supabase,
  });

  const members = memberRoles?.organizationMemberships ?? (memberRoles as any)?.organizationMembers;
  const member = members?.find((m: { organization_id: string }) => m.organization_id === orgId);

  // Transform OrganizationMember to TeamMember
  const teamMember: TeamMember | undefined = member
    ? {
        team_id: member.organization_id, // Use org ID as team ID for workspace context
        organization_id: member.organization_id,
        role: member.role,
        role_id: member.role_id,
      }
    : undefined;

  return {
    member: teamMember,
    isLoading,
  };
}
