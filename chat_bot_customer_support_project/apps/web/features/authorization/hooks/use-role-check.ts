"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { PermissionRequirement, RoleMember } from "@repo/supabase";
import { meetsRequirements } from "../lib/roles";
import { toast } from "react-hot-toast";

interface UseRoleCheckOptions {
  redirectTo?: string;
  fallbackAction?: () => void;
}

export function useRoleCheck(
  member: RoleMember | null,
  options: UseRoleCheckOptions = {}
) {
  const router = useRouter();
  const { redirectTo, fallbackAction } = options;

  const checkAccess = useCallback(
    (requirement: PermissionRequirement): boolean => {
      if (!member) {
        if (redirectTo) {
          toast.error("You are not authorized to perform this action");
          router.push(redirectTo);
        } else if (fallbackAction) {
          toast.error("You are not authorized to perform this action");
          fallbackAction();
        }
        return false;
      }

      const hasAccess = meetsRequirements(member, requirement);
      if (!hasAccess) {
        if (redirectTo) {
          toast.error("You are not authorized to perform this action");
          router.push(redirectTo);
        } else if (fallbackAction) {
          toast.error("You are not authorized to perform this action");
          fallbackAction();
        }
      }
      return hasAccess;
    },
    [member, redirectTo, fallbackAction, router]
  );

  const withRoleGuard = useCallback(
    <T extends (...args: any[]) => any>(
      fn: T,
      requirement: PermissionRequirement
    ): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
      return (...args: Parameters<T>) => {
        if (checkAccess(requirement)) {
          return fn(...args);
        } else {
          toast.error("You are not authorized to perform this action");
          return;
        }
      };
    },
    [checkAccess]
  );

  return {
    checkAccess,
    withRoleGuard,
    isAuthenticated: !!member,
  };
}
