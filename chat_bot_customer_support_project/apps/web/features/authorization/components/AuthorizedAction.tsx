"use client";

import React from "react";
import { RoleMember, PermissionRequirement } from "@repo/supabase";
import { meetsRequirements } from "@/features/authorization/lib/roles";

interface AuthorizedActionProps {
  member: RoleMember | null;
  requirement: PermissionRequirement;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders content based on user role and permissions
 *
 * @param member - The current user's membership record with role info
 * @param requirement - The permission requirements to check
 * @param children - Content to show if user is authorized
 * @param fallback - Optional content to show if user is not authorized
 */
export function AuthorizedAction({
  member,
  requirement,
  children,
  fallback,
}: AuthorizedActionProps) {
  const isAuthorized = member && meetsRequirements(member, requirement);

  if (!isAuthorized) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
