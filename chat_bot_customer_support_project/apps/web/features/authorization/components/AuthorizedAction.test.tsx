import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthorizedAction } from "./AuthorizedAction";
import { TeamMember, Permission } from "@repo/supabase";

describe("AuthorizedAction", () => {
  // Mock team member with admin role and specific permissions
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
    team_id: "team-2",
    role_id: "role-2",
    organization_id: "org-1",
    role: {
      name: "member",
      permissions: [{ permission: { action: "view_team" as Permission } }],
    },
  };

  it("should render children when user meets role requirements", () => {
    render(
      <AuthorizedAction
        member={adminMember}
        requirement={{ requiredRole: "admin" }}
      >
        <div data-testid="authorized-content">Admin Content</div>
      </AuthorizedAction>
    );

    expect(screen.getByTestId("authorized-content")).toBeInTheDocument();
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("should not render children when user does not meet role requirements", () => {
    render(
      <AuthorizedAction
        member={regularMember}
        requirement={{ requiredRole: "admin" }}
      >
        <div data-testid="authorized-content">Admin Content</div>
      </AuthorizedAction>
    );

    expect(screen.queryByTestId("authorized-content")).not.toBeInTheDocument();
    expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
  });

  it("should render children when user meets permission requirements", () => {
    render(
      <AuthorizedAction
        member={adminMember}
        requirement={{ requiredPermissions: ["manage_organization"] }}
      >
        <div data-testid="authorized-content">Has Management Permission</div>
      </AuthorizedAction>
    );

    expect(screen.getByTestId("authorized-content")).toBeInTheDocument();
    expect(screen.getByText("Has Management Permission")).toBeInTheDocument();
  });

  it("should not render children when user does not meet permission requirements", () => {
    render(
      <AuthorizedAction
        member={regularMember}
        requirement={{ requiredPermissions: ["manage_organization"] }}
      >
        <div data-testid="authorized-content">Has Management Permission</div>
      </AuthorizedAction>
    );

    expect(screen.queryByTestId("authorized-content")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Has Management Permission")
    ).not.toBeInTheDocument();
  });

  it("should render fallback content when provided and user is not authorized", () => {
    render(
      <AuthorizedAction
        member={regularMember}
        requirement={{ requiredRole: "admin" }}
        fallback={<div data-testid="fallback-content">Unauthorized</div>}
      >
        <div data-testid="authorized-content">Admin Content</div>
      </AuthorizedAction>
    );

    expect(screen.queryByTestId("authorized-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });

  it("should handle null member gracefully", () => {
    render(
      <AuthorizedAction
        member={null}
        requirement={{ requiredRole: "admin" }}
        fallback={<div data-testid="fallback-content">Not Logged In</div>}
      >
        <div data-testid="authorized-content">Admin Content</div>
      </AuthorizedAction>
    );

    expect(screen.queryByTestId("authorized-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("fallback-content")).toBeInTheDocument();
    expect(screen.getByText("Not Logged In")).toBeInTheDocument();
  });

  it("should render nothing when user is not authorized and no fallback is provided", () => {
    const { container } = render(
      <AuthorizedAction
        member={regularMember}
        requirement={{ requiredRole: "admin" }}
      >
        <div data-testid="authorized-content">Admin Content</div>
      </AuthorizedAction>
    );

    expect(screen.queryByTestId("authorized-content")).not.toBeInTheDocument();
    expect(container.innerHTML).toBe("");
  });
});
