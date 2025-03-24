import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useWorkspaceMember } from "./use-workspace-member";
import { Permission } from "@repo/supabase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { useMemberRoles } from "./use-member-roles";

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
} as unknown as SupabaseClient;

// Mock the useMemberRoles hook
vi.mock("./use-member-roles", () => ({
  useMemberRoles: vi.fn()
}));

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useWorkspaceMember", () => {
  const userId = "user-1";
  const orgId = "org-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null when loading", () => {
    vi.mocked(useMemberRoles).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isIdle: false,
      isFetched: false,
      isSuccess: false,
      refetch: () => Promise.resolve({} as any),
      status: "pending",
      isFetching: false
    } as any);

    const { result } = renderHook(
      () => useWorkspaceMember({ userId, orgId, supabase: mockSupabaseClient }),
      { wrapper: createWrapper() }
    );
    expect(result.current.member).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it("should return null when there is an error", () => {
    vi.mocked(useMemberRoles).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: {
        operation: "test",
        toastMessage: "Test error",
        errorCode: "PGRST0" as any
      },
      isError: true,
      isIdle: false,
      isFetched: false,
      isSuccess: false,
      refetch: () => Promise.resolve({} as any),
      status: "error",
      isFetching: false
    } as any);

    const { result } = renderHook(
      () => useWorkspaceMember({ userId, orgId, supabase: mockSupabaseClient }),
      { wrapper: createWrapper() }
    );
    expect(result.current.member).toBeUndefined();
  });

  it("should return member data when available", async () => {
    vi.mocked(useMemberRoles).mockReturnValue({
      data: {
        organizationMembers: [
          {
            organization_id: "org-1",
            role: {
              name: "admin",
              permissions: [
                { permission: { action: "manage_organization" as Permission } },
                { permission: { action: "manage_team_members" as Permission } }
              ]
            }
          }
        ],
        teamMembers: [
          {
            team_id: "team-1",
            organization_id: "org-1",
            role: {
              name: "admin",
              permissions: [
                { permission: { action: "manage_organization" as Permission } },
                { permission: { action: "manage_team_members" as Permission } }
              ]
            }
          }
        ]
      },
      isLoading: false,
      error: null,
      isError: false,
      isIdle: false,
      isFetched: true,
      isSuccess: true,
      refetch: async () => ({}),
      status: "success",
      isFetching: false
    } as any);

    const { result } = renderHook(
      () => useWorkspaceMember({ userId, orgId, supabase: mockSupabaseClient }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const member = result.current.member;
      expect(member).toBeDefined();
      expect(member?.organization_id).toBe("org-1");
      expect(member?.role.name).toBe("admin");
      expect(member?.role.permissions).toHaveLength(2);
      expect(member?.role.permissions[0].permission.action).toBe(
        "manage_organization"
      );
    });
  });

  it("should transform member data correctly", async () => {
    vi.mocked(useMemberRoles).mockReturnValue({
      data: {
        organizationMembers: [
          {
            organization_id: "org-1",
            role: {
              name: "admin",
              permissions: [
                { permission: { action: "manage_organization" as Permission } },
                { permission: { action: "manage_team_members" as Permission } }
              ]
            }
          }
        ],
        teamMembers: [
          {
            team_id: "team-1",
            organization_id: "org-1",
            role: {
              name: "admin",
              permissions: [
                { permission: { action: "manage_organization" as Permission } },
                { permission: { action: "manage_team_members" as Permission } }
              ]
            }
          }
        ]
      },
      isLoading: false,
      error: null,
      isError: false,
      isIdle: false,
      isFetched: true,
      isSuccess: true,
      refetch: async () => ({}),
      status: "success",
      isFetching: false
    } as any);

    const { result } = renderHook(
      () => useWorkspaceMember({ userId, orgId, supabase: mockSupabaseClient }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const member = result.current.member;
      expect(member).toMatchObject({
        organization_id: "org-1",
        role: {
          name: "admin",
          permissions: [
            { permission: { action: "manage_organization" } },
            { permission: { action: "manage_team_members" } },
          ],
        },
      });
    });
  });
}); 