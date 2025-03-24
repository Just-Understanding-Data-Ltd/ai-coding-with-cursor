import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TeamManagementPanel } from "./TeamManagementPanel";
import { TeamMember, Permission } from "@repo/supabase";

describe("TeamManagementPanel", () => {
  // Mock team member with admin role and full permissions
  const adminMember: TeamMember = {
    team_id: "team-1",
    role_id: "role-1",
    organization_id: "org-1",
    role: {
      name: "admin",
      permissions: [
        { permission: { action: "manage_organization" as Permission } },
        { permission: { action: "manage_team_members" as Permission } },
      ],
    },
  };

  // Mock team member with regular member role and limited permissions
  const regularMember: TeamMember = {
    team_id: "team-1",
    role_id: "role-2",
    organization_id: "org-1",
    role: {
      name: "member",
      permissions: [{ permission: { action: "view_team" as Permission } }],
    },
  };

  // Mock functions for component actions
  const mockOnAddMember = vi.fn();
  const mockOnRemoveMember = vi.fn();
  const mockOnEditSettings = vi.fn();

  it("should show all sections to admin users", () => {
    render(
      <TeamManagementPanel
        currentMember={adminMember}
        teamName="Engineering"
        onAddMember={mockOnAddMember}
        onRemoveMember={mockOnRemoveMember}
        onEditSettings={mockOnEditSettings}
      />
    );

    // Check that the team name is shown
    expect(screen.getByText("Engineering Management")).toBeInTheDocument();

    // Check that basic team info section is shown
    expect(screen.getByText("Team Information")).toBeInTheDocument();

    // Check that admin sections are shown
    expect(screen.getByText("Team Member Management")).toBeInTheDocument();
    expect(screen.getByText("Add Member")).toBeInTheDocument();
    expect(screen.getByText("Remove Member")).toBeInTheDocument();

    // Check that settings section is shown
    expect(screen.getByText("Team Settings")).toBeInTheDocument();
    expect(screen.getByText("Edit Settings")).toBeInTheDocument();
  });

  it("should hide admin sections from regular members", () => {
    render(
      <TeamManagementPanel
        currentMember={regularMember}
        teamName="Engineering"
        onAddMember={mockOnAddMember}
        onRemoveMember={mockOnRemoveMember}
        onEditSettings={mockOnEditSettings}
      />
    );

    // Check that the team name is shown
    expect(screen.getByText("Engineering Management")).toBeInTheDocument();

    // Check that basic team info section is shown
    expect(screen.getByText("Team Information")).toBeInTheDocument();

    // Check that admin sections are NOT shown
    expect(
      screen.queryByText("Team Member Management")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Add Member")).not.toBeInTheDocument();
    expect(screen.queryByText("Remove Member")).not.toBeInTheDocument();

    // Check that settings section is replaced with unauthorized message
    expect(screen.queryByText("Team Settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit Settings")).not.toBeInTheDocument();
    expect(
      screen.getByText("Settings management requires special permissions.")
    ).toBeInTheDocument();
  });

  it("should handle null member gracefully", () => {
    render(
      <TeamManagementPanel
        currentMember={null}
        teamName="Engineering"
        onAddMember={mockOnAddMember}
        onRemoveMember={mockOnRemoveMember}
        onEditSettings={mockOnEditSettings}
      />
    );

    // Check that the team name is shown
    expect(screen.getByText("Engineering Management")).toBeInTheDocument();

    // Check that basic team info section is shown
    expect(screen.getByText("Team Information")).toBeInTheDocument();

    // Check that all permission-restricted sections are NOT shown
    expect(
      screen.queryByText("Team Member Management")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Add Member")).not.toBeInTheDocument();
    expect(screen.queryByText("Remove Member")).not.toBeInTheDocument();
    expect(screen.queryByText("Team Settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit Settings")).not.toBeInTheDocument();
  });

  it("should call the appropriate handler when buttons are clicked", () => {
    render(
      <TeamManagementPanel
        currentMember={adminMember}
        teamName="Engineering"
        onAddMember={mockOnAddMember}
        onRemoveMember={mockOnRemoveMember}
        onEditSettings={mockOnEditSettings}
      />
    );

    // Click the Add Member button
    fireEvent.click(screen.getByText("Add Member"));
    expect(mockOnAddMember).toHaveBeenCalledTimes(1);

    // Click the Remove Member button
    fireEvent.click(screen.getByText("Remove Member"));
    expect(mockOnRemoveMember).toHaveBeenCalledTimes(1);

    // Click the Edit Settings button
    fireEvent.click(screen.getByText("Edit Settings"));
    expect(mockOnEditSettings).toHaveBeenCalledTimes(1);
  });
});
