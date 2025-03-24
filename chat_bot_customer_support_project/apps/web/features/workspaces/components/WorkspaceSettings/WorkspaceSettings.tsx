import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Team, Permission } from "@repo/supabase";
import { useRoleCheck } from "@/features/authorization/hooks/use-role-check";
import { GeneralSettings } from "./GeneralSettings";
import { InvitationsTab } from "./InvitationsTab";
import { PendingInvitationsTab } from "./PendingInvitationsTab";
import { TeamMembersTab } from "./TeamMembersTab";

// Define a more flexible Team type for the component
interface FlexibleTeam {
  id: string;
  name: string;
  organization_id: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  website?: string | null;
}

interface WorkspaceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  team: FlexibleTeam;
  currentMember: any; // TODO - Replace with proper type.
}

export function WorkspaceSettings({
  isOpen,
  onClose,
  team,
  currentMember,
}: WorkspaceSettingsProps) {
  const [activeTab, setActiveTab] = useState("general");
  const { checkAccess } = useRoleCheck(currentMember || null);
  const canManageWorkspace = checkAccess({
    requiredPermissions: ["manage_organization" as Permission],
  });

  // Switch to pending tab when an invitation is sent
  const handleInvitationSent = () => {
    setActiveTab("pending");
  };

  // Reset to general tab when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("general");
    }
  }, [isOpen]);

  if (!canManageWorkspace) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Workspace Settings - {team.name}</DialogTitle>
          <DialogDescription>
            Manage your team, invitations, and workspace settings
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invite">Invite</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings
              team={team as Team}
              currentMember={currentMember}
              canManageWorkspace={canManageWorkspace}
            />
          </TabsContent>

          <TabsContent value="members">
            <TeamMembersTab team={team as Team} currentMember={currentMember} />
          </TabsContent>

          <TabsContent value="invite">
            <InvitationsTab
              team={team as Team}
              onInvitationSent={handleInvitationSent}
              currentMember={currentMember}
            />
          </TabsContent>

          <TabsContent value="pending">
            <PendingInvitationsTab
              team={team as Team}
              currentMember={currentMember}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
