"use client";

import { useState } from "react";
import { Team } from "@repo/supabase";
import { useInvitations, useRevokeInvitation } from "@repo/supabase";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, XCircle } from "lucide-react";

interface PendingInvitationsTabProps {
  team: Team;
  currentMember?: any;
}

export function PendingInvitationsTab({
  team,
  currentMember,
}: PendingInvitationsTabProps) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [isRefetching, setIsRefetching] = useState(false);

  const {
    data: invitations = [],
    isLoading,
    refetch,
  } = useInvitations({
    teamId: team.id,
    includeNoTeam: true,
    supabase,
  });

  const { mutate: revokeInvitation, isPending: isRevoking } =
    useRevokeInvitation({
      supabase,
    });

  const handleRevoke = (token: string) => {
    revokeInvitation(
      {
        token,
        teamId: team.id,
      },
      {}
    );
  };

  const handleRefresh = async () => {
    setIsRefetching(true);
    try {
      await refetch();
      toast.success("Invitations refreshed");
    } catch (error) {
      toast.error("Failed to refresh invitations");
    } finally {
      setIsRefetching(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Pending Invitations</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5">
            {invitations.length}{" "}
            {invitations.length === 1 ? "Invitation" : "Invitations"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching || isLoading}
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="animate-pulse">Loading invitations...</div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="font-medium">
                  {invitation.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      invitation.membership_type === "team"
                        ? "bg-blue-50"
                        : "bg-orange-50"
                    }
                  >
                    {invitation.membership_type === "team" ? "Team" : "Client"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    title={new Date(invitation.expires_at).toLocaleString()}
                  >
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(invitation.token)}
                    disabled={isRevoking}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Revoke
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {invitations.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No pending invitations
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
