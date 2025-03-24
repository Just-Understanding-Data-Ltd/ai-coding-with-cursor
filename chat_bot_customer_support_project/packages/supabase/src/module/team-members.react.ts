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
import { SupabaseClient } from "../index";
import {
  type TeamMember,
  type TeamMemberInsert,
  type TeamMemberUpdate,
  getTeamMember,
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  TeamMemberOperationError,
} from "./team-members";

type QueryKey = readonly [string, ...unknown[]];

/**
 * React Query key factory for team member-related queries
 */
export const teamMemberKeys = {
  all: ["team-members"] as const,
  lists: () => ["team-members", "list"] as QueryKey,
  list: (filters: { teamId?: string }): QueryKey => [
    "team-members",
    "list",
    filters,
  ],
  details: () => ["team-members", "detail"] as QueryKey,
  detail: (id: string): QueryKey => ["team-members", "detail", id],
};

/**
 * Static query keys for server-side usage
 */
export const teamMemberQueryKeys = {
  all: ["team-members"],
  lists: ["team-members", "list"],
  list: (filters: { teamId?: string }) => ["team-members", "list", filters],
  details: ["team-members", "detail"],
  detail: (id: string) => ["team-members", "detail", id],
} as const;

/**
 * Hook for fetching a single team member by ID.
 *
 * @param {object} params - Hook parameters
 * @param {string} params.memberId - The ID of the team member to fetch
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseQueryOptions<TeamMember | null, TeamMemberOperationError>>} [params.options] - Additional React Query options
 * @returns Query result with data and error
 *
 * @example
 * ```typescript
 * const { data: member, isLoading, error } = useTeamMember({
 *   memberId: 'member-123',
 *   supabase
 * });
 * ```
 */
export function useTeamMember({
  memberId,
  supabase,
  options = {},
}: {
  memberId: string;
  supabase: SupabaseClient;
  options?: Partial<
    UseQueryOptions<TeamMember | null, TeamMemberOperationError>
  >;
}) {
  const queryKey = memberId
    ? teamMemberKeys.detail(memberId)
    : ["team-members", "detail", "NO_ID"];
  const queryFn = async () => getTeamMember({ supabase, memberId });

  return useQuery<TeamMember | null, TeamMemberOperationError>({
    queryKey,
    queryFn: queryFn,
    ...options,
  });
}

/**
 * Hook for fetching all members of a team.
 *
 * @param {object} params - Hook parameters
 * @param {string} params.teamId - The ID of the team
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseQueryOptions<TeamMember[], TeamMemberOperationError>>} [params.options] - Additional React Query options
 * @returns Query result with data and error
 *
 * @example
 * ```typescript
 * const { data: members, isLoading, error } = useTeamMembers({
 *   teamId: 'team-123',
 *   supabase
 * });
 * ```
 */
export function useTeamMembers({
  teamId,
  supabase,
  options = {},
}: {
  teamId: string;
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<TeamMember[], TeamMemberOperationError>>;
}) {
  return useQuery<TeamMember[], TeamMemberOperationError>({
    queryKey: teamMemberKeys.list({ teamId }),
    queryFn: async () => getTeamMembers({ supabase, teamId }),
    ...options,
  });
}

/**
 * Hook for creating a new team member, with toast notifications.
 *
 * @param {object} params - Hook parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseMutationOptions<TeamMember, TeamMemberOperationError, { member: TeamMemberInsert }>>} [params.options] - Mutation options
 * @returns Mutation result with status and handlers
 *
 * @example
 * ```typescript
 * const { mutate: executeCreateMember } = useCreateTeamMember({
 *   supabase,
 *   options: {
 *     onSuccess: (newMember) => {
 *       console.log('Member created:', newMember);
 *     },
 *   },
 * });
 *
 * executeCreateMember({
 *   member: {
 *     team_id: 'team-123',
 *     user_id: 'user-123',
 *     role_id: 'role-123'
 *   }
 * });
 * ```
 */
export function useCreateTeamMember({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      TeamMember,
      TeamMemberOperationError,
      { member: TeamMemberInsert }
    >
  >;
}): UseMutationResult<
  TeamMember,
  TeamMemberOperationError,
  { member: TeamMemberInsert }
> {
  const queryClient = useQueryClient();
  return useMutation<
    TeamMember,
    TeamMemberOperationError,
    { member: TeamMemberInsert }
  >({
    mutationFn: async ({ member }) => createTeamMember({ supabase, member }),
    onSuccess: (data, variables, ctx) => {
      if (data.team_id) {
        queryClient.invalidateQueries({
          queryKey: teamMemberKeys.list({ teamId: data.team_id }),
        });
      }
      moduleToast.success("Team member added successfully!");
      if (options?.onSuccess) options.onSuccess(data, variables, ctx);
    },
    onError: (err, variables, ctx) => {
      moduleToast.error(`${err.toastMessage}`);
      throw err;
    },
    ...options,
    throwOnError: true,
  });
}

/**
 * Hook for updating a team member, with toast notifications.
 *
 * @param {object} params - Hook parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseMutationOptions<TeamMember, TeamMemberOperationError, { memberId: string; member: TeamMemberUpdate }>>} [params.options] - Mutation options
 * @returns Mutation result with status and handlers
 *
 * @example
 * ```typescript
 * const { mutate: executeUpdateMember } = useUpdateTeamMember({
 *   supabase,
 *   options: {
 *     onSuccess: (updatedMember) => {
 *       console.log('Member updated:', updatedMember);
 *     },
 *   },
 * });
 *
 * executeUpdateMember({
 *   memberId: 'member-123',
 *   member: { role_id: 'new-role-123' }
 * });
 * ```
 */
export function useUpdateTeamMember({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      TeamMember,
      TeamMemberOperationError,
      { memberId: string; member: TeamMemberUpdate }
    >
  >;
}): UseMutationResult<
  TeamMember,
  TeamMemberOperationError,
  { memberId: string; member: TeamMemberUpdate }
> {
  const queryClient = useQueryClient();
  return useMutation<
    TeamMember,
    TeamMemberOperationError,
    { memberId: string; member: TeamMemberUpdate }
  >({
    mutationFn: async ({ memberId, member }) =>
      updateTeamMember({ supabase, memberId, member }),
    onSuccess: (data, variables, ctx) => {
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.detail(variables.memberId),
      });
      if (data.team_id) {
        queryClient.invalidateQueries({
          queryKey: teamMemberKeys.list({ teamId: data.team_id }),
        });
      }
      moduleToast.success("Team member updated successfully!");
      if (options?.onSuccess) options.onSuccess(data, variables, ctx);
    },
    onError: (err, variables, ctx) => {
      moduleToast.error(`${err.toastMessage}`);
      throw err;
    },
    ...options,
    throwOnError: true,
  });
}

/**
 * Hook for deleting a team member, with toast notifications.
 *
 * @param {object} params - Hook parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseMutationOptions<void, TeamMemberOperationError, { memberId: string; teamId: string }>>} [params.options] - Mutation options
 * @returns Mutation result with status and handlers
 *
 * @example
 * ```typescript
 * const { mutate: executeDeleteMember } = useDeleteTeamMember({
 *   supabase,
 *   options: {
 *     onSuccess: () => {
 *       console.log('Member deleted');
 *     },
 *   },
 * });
 *
 * executeDeleteMember({
 *   memberId: 'member-123',
 *   teamId: 'team-123'
 * });
 * ```
 */
export function useDeleteTeamMember({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      void,
      TeamMemberOperationError,
      { memberId: string; teamId: string }
    >
  >;
}): UseMutationResult<
  void,
  TeamMemberOperationError,
  { memberId: string; teamId: string }
> {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    TeamMemberOperationError,
    { memberId: string; teamId: string }
  >({
    mutationFn: async ({ memberId }) =>
      deleteTeamMember({ supabase, memberId }),
    onSuccess: (_, variables, ctx) => {
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.detail(variables.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.list({ teamId: variables.teamId }),
      });
      moduleToast.success("Team member removed successfully!");
      if (options?.onSuccess) options.onSuccess(_, variables, ctx);
    },
    onError: (err, variables, ctx) => {
      moduleToast.error(`${err.toastMessage}`);
      throw err;
    },
    ...options,
    throwOnError: true,
  });
}
