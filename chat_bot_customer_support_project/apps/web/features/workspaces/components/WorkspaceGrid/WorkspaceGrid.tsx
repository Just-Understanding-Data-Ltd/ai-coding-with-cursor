"use client";

import { Team, TeamMember, Permission } from "@repo/supabase";
import { WorkspaceCard } from "../WorkspaceCard/WorkspaceCard";
import { withRoleCheck } from "@/features/authorization/hooks/withRoleCheck";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreateTeam } from "@repo/supabase";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface WorkspaceGridProps {
  teams: Team[];
  currentMember: TeamMember;
  isLoading?: boolean;
}

const CreateWorkspaceButton = withRoleCheck(Button, {
  requiredPermissions: ["manage_organization" as Permission],
});

export function WorkspaceGrid({
  teams,
  currentMember,
  isLoading,
}: WorkspaceGridProps) {
  const supabase = createClient();
  const { mutate: createTeam } = useCreateTeam({ supabase });
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
  });

  // Explicitly check for the manage_organization permission
  const hasManageOrgPermission = currentMember?.role?.permissions?.some(
    (p) => p?.permission?.action === "manage_organization"
  );

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    createTeam(
      {
        team: {
          name: formData.name,
          website: formData.website || null,
          organization_id: currentMember.organization_id,
        },
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setFormData({ name: "", website: "" });
          toast.success("Workspace created successfully");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton width={200} height={32} />
          <Skeleton width={180} height={40} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton height={200} className="rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Workspaces</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <CreateWorkspaceButton
              currentMember={currentMember}
              variant="default"
              data-testid="create-workspace-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </CreateWorkspaceButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription>
                Create a new workspace to organize your team and projects.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleCreateWorkspace}
              className="grid gap-4 py-4"
              role="form"
            >
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter workspace name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">
            No workspaces found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating a new workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <WorkspaceCard
              key={team.id}
              team={team}
              currentMember={currentMember}
            />
          ))}
        </div>
      )}
    </div>
  );
}
