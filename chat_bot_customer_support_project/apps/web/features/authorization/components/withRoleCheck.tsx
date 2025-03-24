"use client";

import React from "react";
import { WithRoleCheck, meetsRequirements } from "../lib/roles";
import { PermissionRequirement } from "@repo/supabase";

export function withRoleCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requirement: PermissionRequirement
) {
  return React.forwardRef<unknown, WithRoleCheck<P>>(
    function WithRoleCheckWrapper(props, ref) {
      const { currentMember, showIfUnauthorized = false, ...rest } = props;

      const isAuthorized = meetsRequirements(currentMember, requirement);

      if (!isAuthorized && !showIfUnauthorized) {
        return null;
      }

      return (
        <WrappedComponent
          ref={ref}
          {...(rest as P)}
          disabled={!isAuthorized}
          aria-disabled={!isAuthorized}
        />
      );
    }
  );
}
