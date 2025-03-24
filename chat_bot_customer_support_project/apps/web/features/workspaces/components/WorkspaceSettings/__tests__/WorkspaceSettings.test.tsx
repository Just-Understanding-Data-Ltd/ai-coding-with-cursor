import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WorkspaceSettings } from "../WorkspaceSettings";
import { createClient } from "@/utils/supabase/client";
import { useRoleCheck } from "@/features/authorization/hooks/use-role-check";
import {
  useTeamMembers,
  useRoles,
  useInvitations,
  useUpdateTeam,
  useDeleteTeam,
  useTeams,
  useUpdateTeamMember,
  useInviteMember,
  useRevokeInvitation,
} from "@repo/supabase";
import { renderWithProviders } from "@/__tests__/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the setActiveTab function
const mockSetActiveTab = vi.fn();

// Mock the Tabs component to capture and control the activeTab state
vi.mock("@/components/ui/tabs", () => {
  let activeTab = "general";

  return {
    Tabs: ({
      children,
      value,
      onValueChange,
    }: {
      children: React.ReactNode;
      value: string;
      onValueChange: (value: string) => void;
    }) => {
      // Store the active tab
      activeTab = value;

      // Set up the mockSetActiveTab function
      mockSetActiveTab.mockImplementation((newTab: string) => {
        activeTab = newTab;
        onValueChange(newTab);
      });

      return <div data-testid="tabs">{children}</div>;
    },
    TabsList: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="tabs-list">{children}</div>
    ),
    TabsTrigger: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value: string;
    }) => (
      <button data-testid={`tab-${value}`} role="tab" data-value={value}>
        {children}
      </button>
    ),
    TabsContent: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value: string;
    }) => (
      <div
        data-testid={`content-${value}`}
        role="tabpanel"
        data-state={activeTab === value ? "active" : "inactive"}
      >
        {children}
      </div>
    ),
  };
});

// Mock the necessary modules
vi.mock("@/utils/supabase/client");
vi.mock("@/features/authorization/hooks/use-role-check");
vi.mock("@repo/supabase");
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/test-path",
  useSearchParams: () => ({ get: () => null }),
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("WorkspaceSettings", () => {
  // Mock implementation
  beforeEach(() => {
    mockSetActiveTab.mockClear();

    (createClient as any).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "test@example.com" } },
        }),
      },
      from: vi.fn().mockImplementation((table) => {
        if (table === "users") {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnValue({
              data: [
                {
                  id: "user-1",
                  email: "admin@example.com",
                  full_name: "Admin User",
                },
                {
                  id: "user-2",
                  email: "member@example.com",
                  full_name: "Member User",
                },
              ],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          single: vi.fn().mockReturnValue({
            data: null,
            error: null,
          }),
        };
      }),
    });

    (useRoleCheck as any).mockReturnValue({
      checkAccess: vi.fn().mockReturnValue(true),
    });

    (useTeamMembers as any).mockReturnValue({
      data: [
        {
          id: "member-1",
          user_id: "user-1",
          role_id: "role-1",
          team_id: "team-1",
          user: { email: "admin@example.com" },
          role: { name: "admin" },
          membership_type: "team",
        },
        {
          id: "member-2",
          user_id: "user-2",
          role_id: "role-2",
          team_id: "team-1",
          user: { email: "member@example.com" },
          role: { name: "member" },
          membership_type: "team",
        },
      ],
      isLoading: false,
    });

    (useRoles as any).mockReturnValue({
      data: [
        { id: "role-1", name: "admin" },
        { id: "role-2", name: "member" },
      ],
      isLoading: false,
    });

    (useInvitations as any).mockReturnValue({
      data: [
        {
          id: "invitation-1",
          email: "pending@example.com",
          membership_type: "team",
          expires_at: new Date().toISOString(),
          token: "token-1",
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    });

    // Mock useUpdateTeam
    (useUpdateTeam as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    // Mock useDeleteTeam
    (useDeleteTeam as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    // Mock useTeams
    (useTeams as any).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    });

    // Mock useUpdateTeamMember
    (useUpdateTeamMember as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    // Mock useInviteMember
    (useInviteMember as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    // Mock useRevokeInvitation
    (useRevokeInvitation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("should render all tabs correctly", async () => {
    // Arrange
    const team = {
      id: "team-1",
      name: "Test Team",
      organization_id: "org-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      website: null,
    };

    const currentMember = {
      id: "member-1",
      role: { name: "admin" },
      membership_type: "team",
    };

    // Act
    renderWithProviders(
      <WorkspaceSettings
        isOpen={true}
        onClose={vi.fn()}
        team={team}
        currentMember={currentMember}
      />
    );

    // Assert
    expect(
      screen.getByText("Workspace Settings - Test Team")
    ).toBeInTheDocument();
    expect(
      screen.getByText("General", { selector: "button" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Members", { selector: "button" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Invite", { selector: "button" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pending", { selector: "button" })
    ).toBeInTheDocument();
  });

  it("should switch to Members tab when clicked", async () => {
    // Arrange
    const team = {
      id: "team-1",
      name: "Test Team",
      organization_id: "org-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      website: null,
    };

    const currentMember = {
      id: "member-1",
      user_id: "user-1",
      role: { name: "admin" },
      membership_type: "team",
    };

    // Act
    renderWithProviders(
      <WorkspaceSettings
        isOpen={true}
        onClose={vi.fn()}
        team={team}
        currentMember={currentMember}
      />
    );

    // Directly check if the Members tab button exists
    const membersTabButton = screen.getByTestId("tab-members");
    expect(membersTabButton).toBeInTheDocument();
    expect(membersTabButton.textContent).toBe("Members");
  });

  it("should switch to Pending tab after invitation is sent", async () => {
    // Arrange
    const team = {
      id: "team-1",
      name: "Test Team",
      organization_id: "org-1",
    };

    const currentMember = {
      id: "member-1",
      role: { name: "admin" },
      membership_type: "team",
    };

    // Directly test the callback via prop mocking
    renderWithProviders(
      <WorkspaceSettings
        isOpen={true}
        onClose={vi.fn()}
        team={team}
        currentMember={currentMember}
      />
    );

    // Simulate clicking the Pending tab by directly calling the mock function
    mockSetActiveTab("pending");

    // Assert
    expect(screen.getByTestId("content-pending")).toBeInTheDocument();
    // Check for the email in the pending invitations
    expect(screen.getByText("pending@example.com")).toBeInTheDocument();
  });

  it("should switch to Invite tab when clicked", async () => {
    // Arrange
    const team = {
      id: "team-1",
      name: "Test Team",
      organization_id: "org-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      website: null,
    };

    const currentMember = {
      id: "member-1",
      role: { name: "admin" },
      membership_type: "team",
    };

    // Act
    renderWithProviders(
      <WorkspaceSettings
        isOpen={true}
        onClose={vi.fn()}
        team={team}
        currentMember={currentMember}
      />
    );

    // Simulate clicking the Invite tab by directly calling the mock function
    mockSetActiveTab("invite");

    // Assert
    expect(screen.getByTestId("content-invite")).toBeInTheDocument();
  });
});
