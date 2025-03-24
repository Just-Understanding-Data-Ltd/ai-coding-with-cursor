"use client";

import {
  useQuery,
  type UseQueryOptions,
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { moduleToast } from "../lib/toast";
import type { Database } from "@repo/supabase";
import type { MembershipType } from "@repo/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseOperationError, SupabaseErrorCode } from "../errors";

export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];

interface InviteMemberParams {
  organizationId: string;
  membershipType: MembershipType;
  email: string;
  roleId: string;
  teamId?: string | null;
  invitedBy: string;
  organizationName: string;
  inviterName: string;
}

type InviteOrgMemberResponse = string;

type QueryKey = readonly [string, ...unknown[]];

/**
 * React Query key factory for invitation-related queries
 */
export const invitationKeys = {
  all: ["invitations"] as const,
  lists: () => ["invitations", "list"] as QueryKey,
  list: (filters: {
    teamId?: string | null;
    includeNoTeam?: boolean;
  }): QueryKey => ["invitations", "list", filters],
  details: () => ["invitations", "detail"] as QueryKey,
  detail: (id: string): QueryKey => ["invitations", "detail", id],
};

/**
 * Static query keys for server-side usage
 */
export const invitationQueryKeys = {
  all: ["invitations"],
  lists: ["invitations", "list"],
  list: (filters: { teamId?: string | null }) => [
    "invitations",
    "list",
    filters,
  ],
  details: ["invitations", "detail"],
  detail: (id: string) => ["invitations", "detail", id],
} as const;

/**
 * Custom error class for invitation operations.
 */
export class InvitationOperationError extends SupabaseOperationError {
  constructor(
    operation: string,
    context: string,
    toastMessage: string,
    errorCode: SupabaseErrorCode,
    cause?: unknown
  ) {
    super(operation, context, toastMessage, errorCode, cause);
  }
}

/**
 * Hook for inviting a member to an organization or team, with toast notifications.
 *
 * @param {object} params - Hook parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseMutationOptions<InviteOrgMemberResponse, Error, InviteMemberParams>>} [params.options] - Mutation options
 * @returns Mutation result with status and handlers
 */
export function useInviteMember({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient<Database>;
  options?: Partial<
    UseMutationOptions<InviteOrgMemberResponse, Error, InviteMemberParams>
  >;
}): UseMutationResult<InviteOrgMemberResponse, Error, InviteMemberParams> {
  const queryClient = useQueryClient();

  return useMutation<InviteOrgMemberResponse, Error, InviteMemberParams>({
    mutationFn: async ({
      organizationId,
      membershipType,
      email,
      roleId,
      teamId,
      invitedBy,
      organizationName,
      inviterName,
    }) => {
      try {
        // First check if there's an existing pending invitation
        const { data: existingInvitations, error: fetchError } = await supabase
          .from("invitations")
          .select("*")
          .eq("email", email)
          .eq("organization_id", organizationId)
          .is("accepted_at", null)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingInvitations) {
          throw new InvitationOperationError(
            "Invite Member",
            "Duplicate invitation",
            "This user already has a pending invitation to this organization.",
            SupabaseErrorCode.VALIDATION_FAILED
          );
        }

        const { data: invitationData, error } = await supabase.rpc(
          "invite_org_member",
          {
            p_organization_id: organizationId,
            p_membership_type: membershipType,
            p_email: email,
            p_role_id: roleId,
            p_invited_by: invitedBy,
            p_expires_at: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(), // 7 days from now
            p_team_id: teamId ?? undefined,
          }
        );

        if (error) throw error;

        // Send invitation email via API route
        const response = await fetch("/api/invitations/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            token: invitationData,
            organizationName,
            inviterName,
            membershipType,
          }),
        });

        if (!response.ok) {
          throw new InvitationOperationError(
            "Invite Member",
            "Failed to send invitation email",
            "Failed to send invitation email. Please try again.",
            SupabaseErrorCode.CREATE_FAILED
          );
        }
        return invitationData;
      } catch (error) {
        if (error instanceof InvitationOperationError) {
          throw error;
        }
        throw new InvitationOperationError(
          "Invite Member",
          "Failed to create invitation",
          "Unable to create invitation. Please try again.",
          SupabaseErrorCode.CREATE_FAILED,
          error
        );
      }
    },
    onSuccess: (data, variables, ctx) => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.list({
          teamId: variables.teamId,
        }),
      });
      moduleToast.success("Invitation sent successfully!");
      if (options?.onSuccess) options.onSuccess(data, variables, ctx);
    },
    onError: (error, variables, ctx) => {
      if (error instanceof InvitationOperationError) {
        moduleToast.error(error.toastMessage);
      } else {
        moduleToast.error("Failed to send invitation. Please try again.");
      }
      if (options?.onError) options.onError(error, variables, ctx);
    },
    ...options,
  });
}

/**
 * Options for fetching invitations.
 */
interface UseInvitationsOptions {
  teamId?: string;
  /**
   * If true, includes any invitation where team_id is null,
   * effectively "global" or "org-level" invites that appear everywhere.
   */
  includeNoTeam?: boolean;
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<Invitation[], Error>>;
}

/**
 * Hook for fetching all pending invitations for a team (or globally).
 *
 * @param {object} params - Hook parameters
 * @param {string} [params.teamId] - The ID of the team
 * @param {boolean} [params.includeNoTeam=false] - If true, also fetch invitations where team_id is null
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseQueryOptions<Invitation[], Error>>} [params.options] - Additional React Query options
 * @returns Query result with data and error
 */
export function useInvitations({
  teamId,
  includeNoTeam = false,
  supabase,
  options = {},
}: UseInvitationsOptions) {
  return useQuery<Invitation[], Error>({
    queryKey: invitationKeys.list({ teamId, includeNoTeam }),
    queryFn: async () => {
      // Base query for pending, non-expired invitations
      let q = supabase
        .from("invitations")
        .select("*")
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString());

      // If we have a specific teamId...
      if (teamId) {
        // If includeNoTeam is true, show both
        // (team-specific invites OR team_id IS NULL).
        if (includeNoTeam) {
          q = q.or(`team_id.eq.${teamId},team_id.is.null`);
        } else {
          q = q.eq("team_id", teamId);
        }
      } else {
        // If no teamId at all, only show global invites
        q = q.is("team_id", null);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    ...options,
  });
}

/**
 * Hook for revoking an invitation, with toast notifications.
 *
 * @param {object} params - Hook parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseMutationOptions<void, Error, { token: string; teamId: string }>>} [params.options] - Mutation options
 * @returns Mutation result with status and handlers
 */
export function useRevokeInvitation({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<void, Error, { token: string; teamId: string }>
  >;
}): UseMutationResult<void, Error, { token: string; teamId: string }> {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { token: string; teamId: string }>({
    mutationFn: async ({ token }) => {
      const { error } = await supabase.rpc("revoke_invitation", {
        p_token: token,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables, ctx) => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.list({
          teamId: variables.teamId,
        }),
      });
      moduleToast.success("Invitation revoked successfully!");
      if (options?.onSuccess) options.onSuccess(_, variables, ctx);
    },
    onError: (error, variables, ctx) => {
      moduleToast.error(error.message);
      if (options?.onError) options.onError(error, variables, ctx);
    },
    ...options,
  });
}
