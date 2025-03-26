import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Supabase Error Types
export * from "./errors";

// Client Type Definition
export type SupabaseClient = ReturnType<typeof createClient<Database>>;

// Role and Permission Types
export type {
  Role,
  Permission,
  RoleMember,
  OrganizationMember,
  TeamMember,
  MemberRolesResponse,
  PermissionRequirement,
  RoleBasedProps,
} from "./types/roles";

// RPC Functions
export * from "./types/database-functions.types";

// Base Types
export type { Json } from "./types";

// Role Based Types
export type MembershipType = Database["public"]["Enums"]["membership_type"];
export * from "./types/roles";

// Database Types
export type { Database } from "./database.types";
export type { Tables } from "./database.types";

// Users
export * from "./module/users";
export * from "./module/users.react";

// Organizations
export * from "./module/organizations";
export * from "./module/organizations.react";

// Organization Members
export * from "./module/organization-members";
export * from "./module/organization-members.react";

// Teams
export * from "./module/teams";
export * from "./module/teams.react";

// Team Members
export * from "./module/team-members";
export * from "./module/team-members.react";

// Chats
export * from "./module/chats";
export * from "./module/chats.react";

// Messages
export * from "./module/messages";
export * from "./module/messages.react";

// Appointments
export * from "./module/appointments";
export * from "./module/appointments.react";

// Re-export types
export * from "./database.types";
export * from "./types";

// Re-export modules
export * from "./module/organization-members.react";
export * from "./module/users";

// Re-export factories for testing
export * from "./factories";

// New invitation hooks
export * from "./module/invitations.react";

// New role hooks
export * from "./module/roles.react";
