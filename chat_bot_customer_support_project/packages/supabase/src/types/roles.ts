import { Database } from "../database.types";

export type Role = "admin" | "member" | string;
export type MembershipType = "client" | "team";
export type Permission = Database["public"]["Enums"]["permission_action"];

export interface RoleMember {
  role_id: string;
  role: {
    name: Role;
    permissions: Array<{
      permission: {
        action: Database["public"]["Enums"]["permission_action"];
      };
    }>;
  };
}

export interface OrganizationMember extends RoleMember {
  organization_id: string;
  membership_type: MembershipType;
}

export interface TeamMember extends RoleMember {
  team_id: string;
  organization_id: string;
}

export interface MemberRolesResponse {
  organizationMemberships: OrganizationMember[];
  teamMemberships: TeamMember[];
}

// Helper type to define permission requirements
export type PermissionRequirement = {
  requiredRole?: Role;
  requiredMembershipType?: MembershipType;
  requiredPermissions?: Database["public"]["Enums"]["permission_action"][];
};

// Helper type for components that need role-based rendering
export type RoleBasedProps = {
  currentMember: OrganizationMember | TeamMember;
  showIfUnauthorized?: boolean;
};
