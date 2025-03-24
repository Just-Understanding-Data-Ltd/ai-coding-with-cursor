import {
  OrganizationMember,
  RoleMember,
  TeamMember,
  PermissionRequirement,
  RoleBasedProps,
} from "../../../../../packages/supabase/src";

// Helper functions to check permissions
export const hasRequiredRole = (
  member: RoleMember,
  requirement: PermissionRequirement
): boolean => {
  if (!requirement.requiredRole) return true;
  return member.role.name === requirement.requiredRole;
};

export const hasRequiredMembershipType = (
  member: OrganizationMember,
  requirement: PermissionRequirement
): boolean => {
  if (!requirement.requiredMembershipType) return true;
  return member.membership_type === requirement.requiredMembershipType;
};

export const hasRequiredPermissions = (
  member: RoleMember,
  requirement: PermissionRequirement
): boolean => {
  if (!requirement.requiredPermissions?.length) return true;
  return requirement.requiredPermissions.every((requiredPermission) =>
    member.role.permissions.some(
      (p) => p.permission.action === requiredPermission
    )
  );
};

// Main permission check function
export const meetsRequirements = (
  member: RoleMember | OrganizationMember | TeamMember | null,
  requirement: PermissionRequirement
): boolean => {
  if (!member) return false;
  const roleCheck = hasRequiredRole(member, requirement);
  const permissionCheck = hasRequiredPermissions(member, requirement);

  if ("membership_type" in member) {
    return (
      roleCheck &&
      permissionCheck &&
      hasRequiredMembershipType(member, requirement)
    );
  }

  return roleCheck && permissionCheck;
};

// HOC type for role-based components
export type WithRoleCheck<P = {}> = P & RoleBasedProps;
