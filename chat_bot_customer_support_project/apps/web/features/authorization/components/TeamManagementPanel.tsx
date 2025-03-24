"use client";

import React from "react";
import { TeamMember, OrganizationMember } from "@repo/supabase";
import { AuthorizedAction } from "./AuthorizedAction";

interface TeamManagementPanelProps {
  currentMember: TeamMember | OrganizationMember | null;
  teamName: string;
  onAddMember?: () => void;
  onRemoveMember?: () => void;
  onEditSettings?: () => void;
}

/**
 * A team management panel component that shows different actions based on user permissions
 */
export function TeamManagementPanel({
  currentMember,
  teamName,
  onAddMember,
  onRemoveMember,
  onEditSettings,
}: TeamManagementPanelProps) {
  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-xl font-bold mb-4">{teamName} Management</h2>

      <div className="space-y-4">
        {/* Only admins with manage_team_members permission can see this section */}
        <AuthorizedAction
          member={currentMember}
          requirement={{
            requiredRole: "admin",
            requiredPermissions: ["manage_team_members"],
          }}
        >
          <div className="bg-blue-50 p-3 rounded">
            <h3 className="font-semibold mb-2">Team Member Management</h3>
            <div className="flex gap-2">
              <button
                onClick={onAddMember}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Member
              </button>
              <button
                onClick={onRemoveMember}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove Member
              </button>
            </div>
          </div>
        </AuthorizedAction>

        {/* Any member can see basic team info */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-semibold mb-2">Team Information</h3>
          <p>Team members have access to view team information.</p>
        </div>

        {/* Only members with manage_organization permission can edit settings */}
        <AuthorizedAction
          member={currentMember}
          requirement={{
            requiredPermissions: ["manage_organization"],
          }}
          fallback={
            <div className="bg-gray-100 p-3 rounded opacity-50">
              <p className="text-gray-500">
                Settings management requires special permissions.
              </p>
            </div>
          }
        >
          <div className="bg-green-50 p-3 rounded">
            <h3 className="font-semibold mb-2">Team Settings</h3>
            <button
              onClick={onEditSettings}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Edit Settings
            </button>
          </div>
        </AuthorizedAction>
      </div>
    </div>
  );
}
