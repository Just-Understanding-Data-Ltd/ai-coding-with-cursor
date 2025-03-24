import { vi } from "vitest";
import { Team, TeamMember, Permission } from "@repo/supabase";

// Mock Supabase hooks
export const mockHooks = {
  useDeleteTeam: vi.fn(),
  useUpdateTeam: vi.fn(),
  useCreateTeam: vi.fn(),
};

vi.mock("@repo/supabase", async () => {
  const actual = await vi.importActual("@repo/supabase");
  return {
    ...actual,
    useDeleteTeam: mockHooks.useDeleteTeam,
    useUpdateTeam: mockHooks.useUpdateTeam,
    useCreateTeam: mockHooks.useCreateTeam,
  };
});

// Mock team data
export const mockTeam: Team = {
  id: "team-1",
  name: "Test Team",
  organization_id: "org-1",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  website: "https://example.com",
};

// Mock team member data
export const mockMemberRole: TeamMember = {
  team_id: mockTeam.id,
  role_id: "role-2",
  organization_id: "org-1",
  role: {
    name: "member",
    permissions: [
      { permission: { action: "view_comments_and_dms" as Permission } }
    ],
  },
};

export const mockAdminMember: TeamMember = {
  team_id: mockTeam.id,
  role_id: "role-1",
  organization_id: "org-1",
  role: {
    name: "admin",
    permissions: [
      { permission: { action: "manage_organization" as Permission } },
      { permission: { action: "manage_team_members" as Permission } },
      { permission: { action: "manage_organization_members" as Permission } },
      { permission: { action: "update_team" as Permission } },
      { permission: { action: "delete_team" as Permission } },
    ],
  },
};
