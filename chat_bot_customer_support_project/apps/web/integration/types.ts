import { Permission } from "@repo/supabase";

export type AdminPermissions = Permission[];
// TODO - Find a better way of representing this
export type MemberPermissions = Exclude<
  Permission,
  | "manage_team_members"
  | "assign_roles"
  | "manage_organization"
  | "manage_organization_members"
  | "manage_billing"
>[];

export enum IntegrationUserScenarioId {
  TeamAdmin = "team-admin",
  TeamMember = "team-member",
  ClientOrgAdmin = "client-org-admin",
  ClientOrgMember = "client-org-member",
}

export interface IntegrationUserScenario {
  scenarioId: IntegrationUserScenarioId;
  description: string;
  email: string;
  password: string;
  orgId: string;
  teamId: string;
  role: string;
  membershipType: string;
  permissions: AdminPermissions | MemberPermissions;
}

export interface IntegrationUserScenarios {
  [key: string]: IntegrationUserScenario;
}

const getAllPermissions = (): AdminPermissions => {
  return [
    "view_comments_and_dms",
    "manage_comments_and_dms",
    "manage_email_inbox",
    "manage_connected_pages",
    "manage_integrations",
    "create_posts",
    "edit_posts",
    "delete_posts",
    "view_posts",
    "schedule_posts",
    "upload_media",
    "manage_media_library",
    "view_analytics",
    "export_analytics",
    "manage_team_members",
    "assign_roles",
    "manage_organization",
    "manage_organization_members",
    "manage_billing",
  ] as const;
};

const restrictedPermissions = [
  "manage_team_members",
  "assign_roles",
  "manage_organization",
  "manage_organization_members",
  "manage_billing",
] as const;

const getMemberPermissions = (): MemberPermissions => {
  return getAllPermissions().filter(
    (permission): permission is MemberPermissions[number] =>
      !restrictedPermissions.includes(
        permission as (typeof restrictedPermissions)[number]
      )
  );
};

export const IntegrationUserScenarios: Record<
  IntegrationUserScenarioId,
  IntegrationUserScenario
> = {
  [IntegrationUserScenarioId.TeamAdmin]: {
    scenarioId: IntegrationUserScenarioId.TeamAdmin,
    description: "Existing user who is an admin in the Team org",
    email: "team.admin@example.com",
    password: "password123",
    orgId: "11111111-2222-3333-4444-555555555555", // Multi-Team Organization
    teamId: "44444444-5555-6666-7777-888888888888", // Marketing Team
    role: "admin",
    membershipType: "team",
    permissions: getAllPermissions(),
  },
  [IntegrationUserScenarioId.TeamMember]: {
    scenarioId: IntegrationUserScenarioId.TeamMember,
    description: "Existing user who is a member in the Team org",
    email: "team.member@example.com",
    password: "password123",
    orgId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    teamId: "aaaaaaaa-0000-0000-0000-aaaaaaaaaaaa",
    role: "member",
    membershipType: "team",
    permissions: getMemberPermissions(),
  },
  [IntegrationUserScenarioId.ClientOrgAdmin]: {
    scenarioId: IntegrationUserScenarioId.ClientOrgAdmin,
    description: "Existing user who is an admin in the Client org",
    email: "client.admin@example.com",
    password: "password123",
    orgId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", // Client Organization
    teamId: "bbbbbbbb-0000-0000-0000-bbbbbbbbbbbb", // Client Projects Team
    role: "admin",
    membershipType: "client",
    permissions: getAllPermissions(),
  },
  [IntegrationUserScenarioId.ClientOrgMember]: {
    scenarioId: IntegrationUserScenarioId.ClientOrgMember,
    description: "Existing user who is a member in the Client org",
    email: "client.member@example.com",
    password: "password123",
    orgId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    teamId: "bbbbbbbb-0000-0000-0000-bbbbbbbbbbbb",
    role: "member",
    membershipType: "client",
    permissions: getMemberPermissions(),
  },
};

/**
 * Retrieves a specific integration user scenario by its ID.
 *
 * @param scenarioId - The unique identifier of the scenario to retrieve
 * @returns The matching integration user scenario
 * @throws Error if scenario ID is not found
 *
 * @example
 * ```ts
 * const adminScenario = getScenarioById(IntegrationUserScenarioId.TeamAdmin);
 * console.log(adminScenario.permissions); // All admin permissions
 * ```
 */
export function getScenarioById(
  scenarioId: IntegrationUserScenarioId
): IntegrationUserScenario {
  const scenario = IntegrationUserScenarios[scenarioId];
  if (!scenario) {
    throw new Error(`Scenario with ID ${scenarioId} not found`);
  }
  return scenario;
}

/**
 * Retrieves all integration user scenarios that match a specific role.
 *
 * @param role - The role to filter scenarios by ('admin' or 'member')
 * @returns Array of matching integration user scenarios
 *
 * @example
 * ```ts
 * const adminScenarios = getScenariosByRole('admin');
 * console.log(adminScenarios.length); // 2 (TeamAdmin and ClientOrgAdmin)
 * ```
 */
export function getScenariosByRole(
  role: "admin" | "member"
): IntegrationUserScenario[] {
  return Object.values(IntegrationUserScenarios).filter(
    (scenario) => scenario.role === role
  );
}

/**
 * Retrieves all integration user scenarios that have a specific permission.
 *
 * @param permission - The permission to check for
 * @returns Array of scenarios that have the specified permission
 *
 * @example
 * ```ts
 * const scenariosWithManageTeam = getScenariosByPermission('manage_team_members');
 * // Returns only admin scenarios since manage_team_members is a restricted permission
 * ```
 */
export function getScenariosByPermission(
  permission: Permission
): IntegrationUserScenario[] {
  return Object.values(IntegrationUserScenarios).filter((scenario) => {
    if (scenario.role === "admin") {
      return true; // Admin has all permissions
    }
    // For members, only check non-restricted permissions
    return scenario.permissions.includes(
      permission as MemberPermissions[number]
    );
  });
}

/**
 * Retrieves all integration user scenarios that have all specified permissions.
 *
 * @param permissions - Array of permissions that scenarios must all have
 * @returns Array of scenarios that have all specified permissions
 *
 * @example
 * ```ts
 * const scenarios = getScenariosWithAllPermissions([
 *   'manage_team_members',
 *   'manage_organization'
 * ]);
 * // Returns only admin scenarios since these are restricted permissions
 * ```
 */
export function getScenariosWithAllPermissions(
  permissions: Permission[]
): IntegrationUserScenario[] {
  return Object.values(IntegrationUserScenarios).filter((scenario) => {
    if (scenario.role === "admin") {
      return true; // Admin has all permissions
    }
    // For members, check if all permissions are non-restricted
    return permissions.every((permission) =>
      scenario.permissions.includes(permission as MemberPermissions[number])
    );
  });
}

/**
 * Retrieves a single scenario by role, throwing an error if multiple found.
 *
 * @param role - The role to find a scenario for ('admin' or 'member')
 * @returns A single integration user scenario
 * @throws Error if no scenario found or if multiple scenarios match
 *
 * @example
 * ```ts
 * const singleAdmin = getSingleScenarioByRole('admin');
 * // Throws error since multiple admin scenarios exist
 * ```
 */
export function getSingleScenarioByRole(
  role: "admin" | "member"
): IntegrationUserScenario {
  const scenarios = getScenariosByRole(role);
  if (scenarios.length === 0) {
    throw new Error(`No scenario found with role: ${role}`);
  }
  if (scenarios.length > 1) {
    throw new Error(
      `Multiple scenarios found with role: ${role}. Use getScenariosByRole() instead.`
    );
  }
  return scenarios[0];
}

/**
 * Retrieves a single scenario with a specific permission, throwing an error if multiple found.
 *
 * @param permission - The permission to check for
 * @returns A single integration user scenario
 * @throws Error if no scenario found or if multiple scenarios match
 *
 * @example
 * ```ts
 * const singleScenario = getSingleScenarioByPermission('view_posts');
 * // Throws error since multiple scenarios have this permission
 * ```
 */
export function getSingleScenarioByPermission(
  permission: Permission
): IntegrationUserScenario {
  const scenarios = getScenariosByPermission(permission);
  if (scenarios.length === 0) {
    throw new Error(`No scenario found with permission: ${permission}`);
  }
  if (scenarios.length > 1) {
    throw new Error(
      `Multiple scenarios found with permission: ${permission}. Use getScenariosByPermission() instead.`
    );
  }
  return scenarios[0];
}

/**
 * Retrieves a single scenario that has all specified permissions, throwing an error if multiple found.
 *
 * @param permissions - Array of permissions that the scenario must have
 * @returns A single integration user scenario
 * @throws Error if no scenario found or if multiple scenarios match
 *
 * @example
 * ```ts
 * const singleScenario = getSingleScenarioWithAllPermissions([
 *   'manage_team_members',
 *   'manage_organization'
 * ]);
 * // Returns a single admin scenario if only one matches
 * ```
 */
export function getSingleScenarioWithAllPermissions(
  permissions: Permission[]
): IntegrationUserScenario {
  const scenarios = getScenariosWithAllPermissions(permissions);
  if (scenarios.length === 0) {
    throw new Error(
      `No scenario found with all permissions: ${permissions.join(", ")}`
    );
  }
  if (scenarios.length > 1) {
    throw new Error(
      `Multiple scenarios found with all permissions: ${permissions.join(", ")}. Use getScenariosWithAllPermissions() instead.`
    );
  }
  return scenarios[0];
}
