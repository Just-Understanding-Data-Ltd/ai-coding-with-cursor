import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { withRoleCheck } from "../hooks/withRoleCheck";
import {
  TeamMember,
  Permission,
  OrganizationMember,
  PermissionRequirement,
  RoleBasedProps,
} from "@repo/supabase";

// Mock the roles lib
vi.mock("../lib/roles", () => ({
  meetsRequirements: vi.fn(),
  WithRoleCheck: vi.fn(),
}));

// Import after mock to get the mocked version
import { meetsRequirements } from "@/features/authorization/lib/roles";

// Define the props type for the wrapped component
interface TestComponentProps extends Omit<RoleBasedProps, "currentMember"> {
  currentMember: (OrganizationMember | TeamMember) | null;
  disabled?: boolean;
}

describe("withRoleCheck", () => {
  // Test component
  const TestComponent: React.FC<TestComponentProps> = ({
    disabled,
    ...props
  }) => (
    <div data-testid="protected-content" {...props}>
      Protected Content
    </div>
  );

  // Mock member with admin role and permissions
  const mockAdminMember: TeamMember = {
    team_id: "team-1",
    organization_id: "org-1",
    role_id: "role-1",
    role: {
      name: "admin",
      permissions: [
        { permission: { action: "manage_organization" as Permission } },
        { permission: { action: "manage_team_members" as Permission } },
      ],
    },
  };

  // Mock member with regular member role
  const mockMemberMember: TeamMember = {
    team_id: "team-1",
    organization_id: "org-1",
    role_id: "role-2",
    role: {
      name: "member",
      permissions: [
        { permission: { action: "view_organization" as Permission } },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render component when member has required role", () => {
    const requirement: PermissionRequirement = {
      requiredRole: "admin",
    };
    const WrappedComponent = withRoleCheck<TestComponentProps>(
      TestComponent,
      requirement
    );

    vi.mocked(meetsRequirements).mockReturnValue(true);

    render(<WrappedComponent currentMember={mockAdminMember} />);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should not render component when member lacks required role", () => {
    const requirement: PermissionRequirement = {
      requiredRole: "admin",
    };
    const WrappedComponent = withRoleCheck<TestComponentProps>(
      TestComponent,
      requirement
    );

    vi.mocked(meetsRequirements).mockReturnValue(false);

    render(<WrappedComponent currentMember={mockMemberMember} />);

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render component when member has required permissions", () => {
    const requirement: PermissionRequirement = {
      requiredPermissions: ["manage_organization"],
    };
    const WrappedComponent = withRoleCheck<TestComponentProps>(
      TestComponent,
      requirement
    );

    vi.mocked(meetsRequirements).mockReturnValue(true);

    render(<WrappedComponent currentMember={mockAdminMember} />);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should not render component when member lacks required permissions", () => {
    const requirement: PermissionRequirement = {
      requiredPermissions: ["manage_organization"],
    };
    const WrappedComponent = withRoleCheck<TestComponentProps>(
      TestComponent,
      requirement
    );

    vi.mocked(meetsRequirements).mockReturnValue(false);

    render(<WrappedComponent currentMember={mockMemberMember} />);

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render component when showIfUnauthorized is true, even if permissions are not met", () => {
    const requirement: PermissionRequirement = {
      requiredPermissions: ["manage_organization"],
    };
    const WrappedComponent = withRoleCheck<TestComponentProps>(
      TestComponent,
      requirement
    );

    vi.mocked(meetsRequirements).mockReturnValue(false);

    render(
      <WrappedComponent
        currentMember={mockMemberMember}
        showIfUnauthorized={true}
      />
    );

    const component = screen.getByTestId("protected-content");
    expect(component).toBeInTheDocument();
    expect(component).toHaveAttribute("aria-disabled", "true");
  });

  it("should not render component when member is not authenticated", () => {
    const requirement: PermissionRequirement = {
      requiredRole: "admin",
    };
    const WrappedComponent = withRoleCheck<TestComponentProps>(
      TestComponent,
      requirement
    );

    vi.mocked(meetsRequirements).mockReturnValue(false);

    render(
      <WrappedComponent
        currentMember={null as any}
        showIfUnauthorized={false}
      />
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should handle both role and permission requirements", () => {
    const requirement: PermissionRequirement = {
      requiredRole: "admin",
      requiredPermissions: ["manage_organization"],
    };
    const WrappedComponent = withRoleCheck<TestComponentProps>(
      TestComponent,
      requirement
    );

    vi.mocked(meetsRequirements).mockReturnValue(true);

    render(<WrappedComponent currentMember={mockAdminMember} />);

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
