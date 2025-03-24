"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Team,
  Permission,
  RoleMember,
  OrganizationMember,
  TeamMember,
} from "@repo/supabase";
import { withRoleCheck } from "@/features/authorization/hooks/withRoleCheck";
import { useDeleteTeam, useUpdateTeam } from "@repo/supabase";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRoleCheck } from "@/features/authorization/hooks/use-role-check";
import { WorkspaceSettings } from "../WorkspaceSettings/WorkspaceSettings";
import { Settings } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface WorkspaceCardProps {
  team: Team;
  currentMember?: OrganizationMember | TeamMember;
  disabled?: boolean;
  isLoading?: boolean;
}

const DeleteButton = withRoleCheck(Button, {
  requiredPermissions: ["delete_team" as Permission],
});

const EditButton = withRoleCheck(Button, {
  requiredPermissions: ["update_team" as Permission],
});

const SettingsButton = withRoleCheck(Button, {
  requiredPermissions: ["manage_organization" as Permission],
});

export function WorkspaceCard({
  team,
  currentMember,
  disabled,
  isLoading,
}: WorkspaceCardProps) {
  const router = useRouter();
  const supabase = createClient();
  const { mutate: deleteTeam } = useDeleteTeam({
    supabase,
  });
  const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam({
    supabase,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { checkAccess } = useRoleCheck(currentMember || null);
  const canManageWorkspace = checkAccess({
    requiredPermissions: ["manage_organization" as Permission],
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this workspace?")) {
      deleteTeam(
        { teamId: team.id },
        {
          onSuccess: () => {
            toast.success("Workspace deleted successfully");
          },
        }
      );
    }
  };

  const handleClick = () => {
    if (team.organization_id) {
      router.push(`/org/${team.organization_id}/${team.id}`);
    }
  };

  const createdDate = team.created_at
    ? new Date(team.created_at).toLocaleDateString()
    : "Unknown date";

  if (isLoading) {
    return (
      <Card className="space-y-4">
        <CardHeader>
          <Skeleton width={150} height={24} />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton width={200} height={16} />
          <Skeleton width={120} height={16} />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Skeleton width={70} height={32} />
          <Skeleton width={100} height={32} />
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Card
        role="article"
        className={`relative ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:shadow-md transition-shadow"
        }`}
        onClick={disabled ? undefined : handleClick}
      >
        <CardHeader>
          <CardTitle
            className="text-lg font-semibold truncate"
            title={team.name}
          >
            {team.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-sm text-gray-500 truncate"
            title={team.website || "No description provided"}
          >
            {team.website || "No description provided"}
          </p>
          <p className="text-sm text-muted-foreground">Created {createdDate}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {currentMember && (
            <>
              <DeleteButton
                currentMember={currentMember}
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                data-testid="delete-button"
                disabled={disabled}
              >
                Delete
              </DeleteButton>
              <SettingsButton
                currentMember={currentMember}
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingsOpen(true);
                }}
                disabled={disabled}
                data-testid="settings-button"
              >
                <Settings className="h-4 w-4" />
                <span className="ml-2">Settings</span>
              </SettingsButton>
            </>
          )}
        </CardFooter>
      </Card>

      <WorkspaceSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        team={team}
        currentMember={currentMember}
      />
    </>
  );
}
