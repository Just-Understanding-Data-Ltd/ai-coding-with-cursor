"use client";

import { useCallback } from "react";
import { useOrganizationPermissions } from "@/hooks/use-organization-permissions";

export function useWorkspacePermissions(organizationId: string | null) {
  const { hasPermission } = useOrganizationPermissions(organizationId);

  const canManageWorkspace = useCallback(() => {
    return hasPermission("manage_organization");
  }, [hasPermission]);

  const canViewWorkspace = useCallback(() => {
    return hasPermission("view_organization");
  }, [hasPermission]);

  return {
    canManageWorkspace: canManageWorkspace(),
    canViewWorkspace: canViewWorkspace(),
  };
}
