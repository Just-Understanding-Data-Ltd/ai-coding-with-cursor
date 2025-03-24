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
  type Team,
  type TeamInsert,
  type TeamUpdate,
  getTeam,
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  TeamOperationError,
} from "./teams";

type QueryKey = readonly [string, ...unknown[]];

/**
 * React Query key factory for team-related queries
 */
export const teamKeys = {
  all: ["teams"] as const,
  lists: () => ["teams", "list"] as QueryKey,
  list: (filters: { organizationId?: string }): QueryKey => [
    "teams",
    "list",
    filters,
  ],
  details: () => ["teams", "detail"] as QueryKey,
  detail: (id: string): QueryKey => ["teams", "detail", id],
};

/**
 * Static query keys for server-side usage
 */
export const teamQueryKeys = {
  all: ["teams"],
  lists: ["teams", "list"],
  list: (filters: { organizationId?: string }) => ["teams", "list", filters],
  details: ["teams", "detail"],
  detail: (id: string) => ["teams", "detail", id],
} as const;

/**
 * Hook for fetching a single team by ID.
 * If teamId is undefined or empty, the query is skipped.
 *
 * @param {object} params - Hook parameters
 * @param {string} [params.teamId] - The ID of the team to fetch
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseQueryOptions<Team | null, TeamOperationError>>} [params.options] - Additional React Query options
 * @returns Query result with data and error
 *
 * @example
 * ```typescript
 * const { data: team, isLoading, error } = useTeam({ teamId: '123', supabase });
 * ```
 */
export function useTeam({
  teamId,
  supabase,
  options = {},
}: {
  teamId: string;
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<Team | null, TeamOperationError>>;
}) {
  const queryKey = teamId
    ? teamKeys.detail(teamId)
    : ["teams", "detail", "NO_ID"];
  const queryFn = async () => getTeam({ supabase, teamId });

  return useQuery<Team | null, TeamOperationError>({
    queryKey,
    queryFn: queryFn,
    ...options,
  });
}

/**
 * Hook for fetching all teams for an organization.
 *
 * @param {object} params - Hook parameters
 * @param {string} params.organizationId - The ID of the organization
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseQueryOptions<Team[], TeamOperationError>>} [params.options] - Additional React Query options
 * @returns Query result with data and error
 *
 * @example
 * ```typescript
 * const { data: teams, isLoading, error } = useTeams({ organizationId: '123', supabase });
 * ```
 */
export function useTeams({
  organizationId,
  supabase,
  options = {},
}: {
  organizationId: string;
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<Team[], TeamOperationError>>;
}) {
  return useQuery<Team[], TeamOperationError>({
    queryKey: teamKeys.list({ organizationId }),
    queryFn: async () => getTeams({ supabase, organizationId }),
    ...options,
  });
}

/**
 * Hook for creating a new team, with toast notifications.
 *
 * @param {object} params - Hook parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseMutationOptions<Team, TeamOperationError, { team: TeamInsert }>>} [params.options] - Mutation options
 * @returns Mutation result with status and handlers
 *
 * @example
 * ```typescript
 * const { mutate: executeCreateTeam, isLoading } = useCreateTeam({
 *   supabase,
 *   options: {
 *     onSuccess: (newTeam) => {
 *       console.log('Team created:', newTeam);
 *     },
 *   },
 * });
 *
 * executeCreateTeam({ team: { name: 'New Team', organization_id: 'org-123' } });
 * ```
 */
export function useCreateTeam({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<Team, TeamOperationError, { team: TeamInsert }>
  >;
}): UseMutationResult<Team, TeamOperationError, { team: TeamInsert }> {
  const queryClient = useQueryClient();
  return useMutation<Team, TeamOperationError, { team: TeamInsert }>({
    mutationFn: async ({ team }) => createTeam({ supabase, team }),
    onSuccess: (data, variables, ctx) => {
      if (data.organization_id) {
        queryClient.invalidateQueries({
          queryKey: teamKeys.list({ organizationId: data.organization_id }),
        });
      }
      moduleToast.success("Team created successfully!");
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
 * Hook for updating an existing team by ID, with toast notifications.
 *
 * @param {object} params - Hook parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseMutationOptions<Team, TeamOperationError, { teamId: string; team: TeamUpdate }>>} [params.options] - Mutation options
 * @returns Mutation result with status and handlers
 *
 * @example
 * ```typescript
 * const { mutate: executeUpdateTeam, isLoading } = useUpdateTeam({
 *   supabase,
 *   options: {
 *     onSuccess: (updatedTeam) => {
 *       console.log('Team updated:', updatedTeam);
 *     },
 *   },
 * });
 *
 * executeUpdateTeam({ teamId: '123', team: { name: 'Updated Name' } });
 * ```
 */
export function useUpdateTeam({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      Team,
      TeamOperationError,
      { teamId: string; team: TeamUpdate }
    >
  >;
}): UseMutationResult<
  Team,
  TeamOperationError,
  { teamId: string; team: TeamUpdate }
> {
  const queryClient = useQueryClient();
  return useMutation<
    Team,
    TeamOperationError,
    { teamId: string; team: TeamUpdate }
  >({
    mutationFn: async ({ teamId, team }) =>
      updateTeam({ supabase, teamId, team }),
    onSuccess: (data, variables, ctx) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(),
      });
      moduleToast.success("Team updated successfully!");
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
 * Hook for deleting a team by ID, with toast notifications.
 *
 * @param {object} params - Hook parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseMutationOptions<void, TeamOperationError, { teamId: string }>>} [params.options] - Mutation options
 * @returns Mutation result with status and handlers
 *
 * @example
 * ```typescript
 * const { mutate: executeDeleteTeam, isLoading } = useDeleteTeam({
 *   supabase,
 *   options: {
 *     onSuccess: () => {
 *       console.log('Team deleted');
 *     },
 *   },
 * });
 *
 * executeDeleteTeam({ teamId: '123' });
 * ```
 */
export function useDeleteTeam({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<void, TeamOperationError, { teamId: string }>
  >;
}): UseMutationResult<void, TeamOperationError, { teamId: string }> {
  const queryClient = useQueryClient();
  return useMutation<void, TeamOperationError, { teamId: string }>({
    mutationFn: async ({ teamId }) => deleteTeam({ supabase, teamId }),
    onSuccess: (_, variables, ctx) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(),
      });
      moduleToast.success("Team deleted successfully!");
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
