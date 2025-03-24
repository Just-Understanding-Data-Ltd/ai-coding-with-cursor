import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRoleCheck } from "./use-role-check";
import { TeamMember, Permission } from "@repo/supabase";

// Add this mock at the top of the file
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  toast: {
    error: vi.fn()
  }
}));

describe("useRoleCheck", () => {
  const mockMember: TeamMember = {
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

  it("should return isAuthenticated=false when member is null", () => {
    const { result } = renderHook(() => useRoleCheck(null));
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should return isAuthenticated=true when member exists", () => {
    const { result } = renderHook(() => useRoleCheck(mockMember));
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should check permissions correctly", () => {
    const { result } = renderHook(() => useRoleCheck(mockMember));
    
    // Should have manage_organization permission
    expect(
      result.current.checkAccess({
        requiredPermissions: ["manage_organization"],
      })
    ).toBe(true);

    // Should have manage_team_members permission
    expect(
      result.current.checkAccess({
        requiredPermissions: ["manage_team_members"],
      })
    ).toBe(true);

    // Should not have manage_billing permission
    expect(
      result.current.checkAccess({
        requiredPermissions: ["manage_billing"],
      })
    ).toBe(false);
  });

  it("should check role correctly", () => {
    const { result } = renderHook(() => useRoleCheck(mockMember));
    
    // Should be admin
    expect(
      result.current.checkAccess({
        requiredRole: "admin",
      })
    ).toBe(true);

    // Should not be member
    expect(
      result.current.checkAccess({
        requiredRole: "member",
      })
    ).toBe(false);
  });

  it("should check both role and permissions", () => {
    const { result } = renderHook(() => useRoleCheck(mockMember));
    
    // Should pass when both match
    expect(
      result.current.checkAccess({
        requiredRole: "admin",
        requiredPermissions: ["manage_organization"],
      })
    ).toBe(true);

    // Should fail when role matches but permission doesn't
    expect(
      result.current.checkAccess({
        requiredRole: "admin",
        requiredPermissions: ["manage_billing"],
      })
    ).toBe(false);

    // Should fail when permission matches but role doesn't
    expect(
      result.current.checkAccess({
        requiredRole: "member",
        requiredPermissions: ["manage_organization"],
      })
    ).toBe(false);
  });
}); 