"use client";

import React, { useState, useEffect } from "react";
import {
  Team,
  Permission,
  useTeamMembers,
  useUpdateTeamMember,
  useRoles,
} from "@repo/supabase";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useRoleCheck } from "@/features/authorization/hooks/use-role-check";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TeamMembersTabProps {
  team: Team;
  currentMember: any; // Replace with proper type
}

// Define our own member type instead of extending TeamMember
type MemberWithExtras = {
  id: string;
  user_id: string | null;
  team_id: string | null;
  role_id: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  organization_id?: string | null;
  user?: {
    email?: string;
    id?: string;
    full_name?: string | null;
  };
  role?: {
    name?: string;
    permissions?: Array<{ permission: { action: string } }>;
  };
  membership_type?: string;
};

export function TeamMembersTab({ team, currentMember }: TeamMembersTabProps) {
  const supabase = createClient();
  const [enrichedMembers, setEnrichedMembers] = useState<MemberWithExtras[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLastMember, setIsLastMember] = useState(false);

  const { data: rawMembers = [], isLoading: isLoadingMembers } = useTeamMembers(
    {
      teamId: team.id,
      supabase,
    }
  );

  const { data: roles = [], isLoading: isLoadingRoles } = useRoles({
    supabase,
  });

  const adminRoleId = roles.find((role) => role.name === "admin")?.id;
  const memberRoleId = roles.find((role) => role.name === "member")?.id;

  const { mutate: updateMember, isPending: isUpdating } = useUpdateTeamMember({
    supabase,
  });

  const { checkAccess } = useRoleCheck(currentMember || null);
  const canManageTeamMembers = checkAccess({
    requiredPermissions: ["manage_team_members" as Permission],
  });

  // Check if current user is an admin
  const isCurrentUserAdmin = currentMember?.role?.name === "admin";

  // Update isLastMember whenever enrichedMembers changes
  useEffect(() => {
    setIsLastMember(enrichedMembers.length <= 1);
  }, [enrichedMembers]);

  // Fetch user data when rawMembers changes
  useEffect(() => {
    async function fetchUserData() {
      if (rawMembers.length === 0 || isLoadingMembers) {
        return;
      }

      setIsLoading(true);

      try {
        // Extract user IDs to fetch
        const userIds = rawMembers
          .map((member) => member.user_id)
          .filter((id): id is string => !!id);

        if (userIds.length === 0) {
          // If no user IDs, just set the raw members
          setEnrichedMembers(rawMembers as MemberWithExtras[]);
          setIsLoading(false);
          return;
        }

        // Fetch user data
        const { data: users, error } = await supabase
          .from("users")
          .select("id, email, full_name")
          .in("id", userIds);

        if (error) {
          throw error;
        }

        // Fetch role data for each member
        const { data: roles, error: rolesError } = await supabase
          .from("roles")
          .select("id, name");

        if (rolesError) {
          throw rolesError;
        }

        // Combine member data with user data and ensure role info is correct
        const membersWithUserData: MemberWithExtras[] = rawMembers.map(
          (member) => {
            const userData = users?.find((user) => user.id === member.user_id);
            const roleData = roles?.find((role) => role.id === member.role_id);

            // Get role info safely from raw member data
            const memberRoleInfo = (member as any).role;

            return {
              ...member,
              user: userData
                ? {
                    id: userData.id,
                    email: userData.email || "Unknown",
                    full_name: userData.full_name,
                  }
                : { email: "Unknown" },
              role: {
                name: roleData?.name || memberRoleInfo?.name || "member",
                permissions: memberRoleInfo?.permissions || [],
              },
            } as MemberWithExtras;
          }
        );

        setEnrichedMembers(membersWithUserData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load member information");
        setEnrichedMembers(rawMembers as MemberWithExtras[]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [rawMembers, isLoadingMembers, supabase]);

  const handleRoleChange = (
    memberId: string,
    currentRoleId: string | null,
    newRoleName: string
  ) => {
    if (!adminRoleId || !memberRoleId) {
      toast.error("Unable to fetch role information");
      return;
    }

    // Get the member we are changing
    const member = enrichedMembers.find((m) => m.id === memberId);
    if (!member) {
      toast.error("Member not found");
      return;
    }

    // Check if this is a demotion of an admin
    const isCurrentlyAdmin = member.role?.name === "admin";
    const isDemotingAdmin = isCurrentlyAdmin && newRoleName === "member";

    // Count how many admins we have
    const adminCount = enrichedMembers.filter(
      (m) => m.role?.name === "admin"
    ).length;

    // If we're demoting an admin and they're the only admin, prevent it
    if (isDemotingAdmin && adminCount <= 1) {
      toast.error(
        "Cannot demote the last admin. Promote another member to admin first."
      );
      return;
    }

    // Only allow promoting to admin, not demoting from admin
    if (isDemotingAdmin) {
      toast.error("Cannot demote an admin to a member");
      return;
    }

    // Set the new role ID based on the selected role name
    const newRoleId = newRoleName === "admin" ? adminRoleId : memberRoleId;

    // Don't do anything if the role isn't changing
    if (newRoleId === currentRoleId) {
      return;
    }

    updateMember(
      {
        memberId,
        member: {
          role_id: newRoleId,
        },
      },
      {
        onSuccess: () => {
          toast.success(`User role updated to ${newRoleName} successfully`);

          // Update local state with new role
          setEnrichedMembers((current) =>
            current.map((m) =>
              m.id === memberId
                ? {
                    ...m,
                    role_id: newRoleId,
                    role: {
                      ...m.role,
                      name: newRoleName,
                    },
                  }
                : m
            )
          );
        },
        onError: (error) => {
          toast.error(`Failed to update member role: ${error.message}`);
        },
      }
    );
  };

  if (isLoading || isLoadingRoles) {
    return (
      <div className="py-8 text-center">
        <div className="animate-pulse">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium" data-testid="team-members-heading">
          Team Members
        </h3>
        <Badge variant="outline" className="bg-primary/5">
          {enrichedMembers.length}{" "}
          {enrichedMembers.length === 1 ? "Member" : "Members"}
        </Badge>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow className="bg-muted/50">
                <TableHead className="w-[300px] font-medium">User</TableHead>
                <TableHead className="w-[180px] font-medium">Role</TableHead>
                <TableHead className="w-[120px] font-medium">Type</TableHead>
                <TableHead className="text-right font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedMembers.map((member) => {
                // Improved current user detection - make explicitly clear what's happening
                // Add more robust checks
                const memberUserId = member.user_id || "";
                const currentUserId = currentMember?.user_id || "";
                const memberId = member.id;
                const currentMemberId = currentMember?.id;

                // Check both ID and user_id to be sure
                const isCurrentUser =
                  (currentMemberId &&
                    memberId &&
                    currentMemberId === memberId) ||
                  (currentUserId &&
                    memberUserId &&
                    currentUserId === memberUserId);

                // When it's the current user, use the role from currentMember prop if available
                const isAdmin = isCurrentUser
                  ? currentMember?.role?.name === "admin"
                  : member.role?.name === "admin";

                const membershipType = member.membership_type || "team";
                const userEmail = member.user?.email || "Unknown";
                const displayName = member.user?.full_name || userEmail;

                // Get first initial for avatar
                const initial = displayName.charAt(0).toUpperCase();

                // Determine if this member can be removed
                const canBeRemoved =
                  !isCurrentUser && !isLastMember && canManageTeamMembers;

                return (
                  <TableRow
                    key={member.id}
                    className={cn("h-16", isCurrentUser && "bg-muted/30")}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarFallback className="bg-primary/10 text-primary-foreground">
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div
                            className="font-medium"
                            data-testid={`member-name-${member.id}`}
                          >
                            {displayName}
                          </div>
                          {isCurrentUser && (
                            <span className="text-xs text-muted-foreground">
                              (You)
                            </span>
                          )}
                          {userEmail !== displayName && (
                            <span
                              className="text-xs text-muted-foreground"
                              data-testid={`member-email-${member.id}`}
                            >
                              {userEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {canManageTeamMembers &&
                      isCurrentUserAdmin &&
                      !isCurrentUser ? (
                        <Select
                          value={isAdmin ? "admin" : "member"}
                          disabled={isUpdating}
                          onValueChange={(value) =>
                            handleRoleChange(member.id, member.role_id, value)
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant={isAdmin ? "default" : "outline"}
                          className={cn(
                            "px-3 py-1 text-xs",
                            isAdmin && "bg-primary text-primary-foreground"
                          )}
                          data-testid={`member-role-${member.id}`}
                        >
                          {isAdmin ? "Admin" : "Member"}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-3 py-1 text-xs",
                          membershipType === "team"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-orange-50 text-orange-800 border-orange-200"
                        )}
                      >
                        {membershipType === "team" ? "Team" : "Client"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {canBeRemoved ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                          disabled={isUpdating}
                        >
                          Remove
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground px-2">
                          {isCurrentUser
                            ? "(Current user)"
                            : isLastMember
                              ? "(Last member)"
                              : ""}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {enrichedMembers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No team members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
