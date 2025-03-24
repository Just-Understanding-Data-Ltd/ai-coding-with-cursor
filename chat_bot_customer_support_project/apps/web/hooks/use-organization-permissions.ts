import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

type PermissionAction = "manage_organization" | "view_organization";

export function useOrganizationPermissions(organizationId: string | null) {
  const supabase = createClient();

  const { data: memberRole } = useQuery({
    queryKey: ["organization-role", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data: member, error } = await supabase
        .from("organization_members")
        .select(
          `
          role_id,
          roles:roles (
            name
          )
        `
        )
        .eq("organization_id", organizationId)
        .single();

      if (error) {
        console.error("Error fetching member role:", error);
        return null;
      }

      return member?.roles?.name || null;
    },
    enabled: !!organizationId,
  });

  const hasPermission = useCallback(
    (action: PermissionAction) => {
      if (!memberRole) return false;

      // Map permission actions to roles
      const rolePermissions: Record<PermissionAction, string[]> = {
        manage_organization: ["admin", "owner"],
        view_organization: ["admin", "owner", "member"],
      };

      return rolePermissions[action].includes(memberRole);
    },
    [memberRole]
  );

  return {
    hasPermission,
    isLoading: !memberRole,
  };
}
