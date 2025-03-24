import { useState } from "react";
import { Team } from "@repo/supabase";
import { useUpdateTeam, useTeams, useDeleteTeam } from "@repo/supabase";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface GeneralSettingsProps {
  team: Team;
  onClose?: () => void;
  currentMember?: any;
  canManageWorkspace?: boolean;
}

export function GeneralSettings({
  team,
  onClose,
  currentMember,
  canManageWorkspace = false,
}: GeneralSettingsProps) {
  const router = useRouter();
  const supabase = createClient();
  const { mutate: updateTeam, isPending } = useUpdateTeam({
    supabase,
  });
  const { mutate: deleteTeam, isPending: isDeleting } = useDeleteTeam({
    supabase,
  });

  const { refetch } = useTeams({
    organizationId: team.organization_id!,
    supabase,
  });

  const [formData, setFormData] = useState({
    name: team.name,
    website: team.website || "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeam(
      {
        teamId: team.id,
        team: {
          name: formData.name,
          website: formData.website || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Workspace updated successfully");
          refetch();
        },
      }
    );
  };

  const handleDelete = () => {
    deleteTeam(
      { teamId: team.id },
      {
        onSuccess: () => {
          toast.success("Workspace deleted successfully");
          refetch();
          if (onClose) {
            onClose();
          }
          router.push(`/org/${team.organization_id}/workspaces`);
        },
        onError: (error) => {
          console.error("Delete error:", error);
          toast.error("Failed to delete workspace");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Workspace Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, website: e.target.value }))
            }
            placeholder="https://example.com"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <div className="border-t pt-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-destructive">
              Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground">
              Once you delete a workspace, there is no going back. Please be
              certain.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Workspace</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone. This will permanently delete
                      the workspace and remove all associated data.
                    </p>
                    <div className="mt-4">
                      <Label htmlFor="confirm">
                        Please type{" "}
                        <span className="font-semibold">{team.name}</span> to
                        confirm
                      </Label>
                      <Input
                        id="confirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="mt-2"
                        placeholder={team.name}
                      />
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== team.name || isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete Workspace"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
