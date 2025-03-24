import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockRedirect, mockSupabaseClient } from "../mocks";
import { Database } from "@repo/supabase";

// Import the component after mocking
import OrgRedirectPage from "@/app/(application)/org/page";

describe("OrgRedirectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to login if no user is found", async () => {
    // Arrange
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } });

    // Act & Assert
    await expect(OrgRedirectPage()).rejects.toThrow();
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("should redirect to onboarding if user has no organization memberships", async () => {
    // Arrange
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "test-user-id" } },
    });
    mockSupabaseClient.from.mockImplementation(
      (table: keyof Database["public"]["Tables"]) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [] }),
          }),
          order: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [] }),
            }),
          }),
        }),
      })
    );

    // Act & Assert
    await expect(OrgRedirectPage()).rejects.toThrow();
    expect(mockRedirect).toHaveBeenCalledWith("/onboarding");
  });

  it("should redirect to workspaces if user has org membership but no team membership", async () => {
    // Arrange
    const orgId = "test-org-id";
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "test-user-id" } },
    });
    mockSupabaseClient.from.mockImplementation(
      (table: keyof Database["public"]["Tables"]) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi
              .fn()
              .mockResolvedValue(
                table === "organization_members"
                  ? { data: [{ organization_id: orgId }] }
                  : { data: [] }
              ),
          }),
          order: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [] }),
            }),
          }),
        }),
      })
    );

    // Act & Assert
    await expect(OrgRedirectPage()).rejects.toThrow(
      `NEXT_REDIRECT:/org/${orgId}/workspaces`
    );
    expect(mockRedirect).toHaveBeenCalledWith(`/org/${orgId}/workspaces`);
  });

  it("should redirect to team workspace if user has both org and team memberships", async () => {
    // Arrange
    const orgId = "test-org-id";
    const teamId = "test-team-id";
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "test-user-id" } },
    });
    mockSupabaseClient.from.mockImplementation(
      (table: keyof Database["public"]["Tables"]) => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi
              .fn()
              .mockResolvedValue(
                table === "organization_members"
                  ? { data: [{ organization_id: orgId }] }
                  : { data: [] }
              ),
          }),
          order: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi
                .fn()
                .mockResolvedValue(
                  table === "team_members"
                    ? { data: [{ team_id: teamId }] }
                    : { data: [] }
                ),
            }),
          }),
        }),
      })
    );

    // Act & Assert
    await expect(OrgRedirectPage()).rejects.toThrow(
      `NEXT_REDIRECT:/org/${orgId}/${teamId}`
    );
    expect(mockRedirect).toHaveBeenCalledWith(`/org/${orgId}/${teamId}`);
  });
});
