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
  type Organization,
  type OrganizationUpdate,
  getOrganization,
  getOrganizations,
  updateOrganization,
  deleteOrganization,
  OrganizationOperationError,
} from "./organizations";

type QueryKey = readonly [string, ...unknown[]];

/**
 * React Query key factory for organization-related queries
 */
export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => ["organizations", "list"] as QueryKey,
  list: (filters: { userId?: string }): QueryKey => [
    "organizations",
    "list",
    filters,
  ],
  details: () => ["organizations", "detail"] as QueryKey,
  detail: (id: string): QueryKey => ["organizations", "detail", id],
};

/**
 * Static query keys for server-side usage
 */
export const organizationQueryKeys = {
  all: ["organizations"],
  lists: ["organizations", "list"],
  list: (filters: { userId?: string }) => ["organizations", "list", filters],
  details: ["organizations", "detail"],
  detail: (id: string) => ["organizations", "detail", id],
} as const;

/**
 * Hook for fetching a single organization by ID.
 * If orgId is undefined or empty, the query is skipped.
 *
 * @param {object} params - Hook parameters
 * @param {string} [params.orgId] - The ID of the organization to fetch
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseQueryOptions<Organization | null, OrganizationOperationError>>} [params.options] - Additional React Query options
 * @returns Query result with data and error
 *
 * @example
 * ```typescript
 * const { data: organization, isLoading, error } = useOrganization({ orgId: '123', supabase });
 * ```
 */
export function useOrganization({
  orgId,
  supabase,
  options = {},
}: {
  orgId: string;
  supabase: SupabaseClient;
  options?: Partial<
    UseQueryOptions<Organization | null, OrganizationOperationError>
  >;
}) {
  const queryKey = orgId
    ? organizationKeys.detail(orgId)
    : ["organizations", "detail", "NO_ID"];
  const queryFn = async () => getOrganization({ supabase, orgId });

  return useQuery<Organization | null, OrganizationOperationError>({
    queryKey,
    queryFn: queryFn,
    ...options,
  });
}

/**
 * Hook for fetching all organizations for a user.
 *
 * @param {object} params - Hook parameters
 * @param {string} params.userId - The ID of the user
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseQueryOptions<Organization[], OrganizationOperationError>>} [params.options] - Additional React Query options
 * @returns Query result with data and error
 *
 * @example
 * ```typescript
 * const { data: organizations, isLoading, error } = useOrganizations({ userId: '123', supabase });
 * ```
 */
export function useOrganizations({
  userId,
  supabase,
  options = {},
}: {
  userId: string;
  supabase: SupabaseClient;
  options?: Partial<
    UseQueryOptions<Organization[], OrganizationOperationError>
  >;
}) {
  return useQuery<Organization[], OrganizationOperationError>({
    queryKey: organizationKeys.list({ userId }),
    queryFn: async () => getOrganizations({ supabase, userId }),
    ...options,
  });
}

/**
 * Hook for updating an existing organization by ID, with toast notifications.
 *
 * @param {object} params - Hook parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseMutationOptions<Organization, OrganizationOperationError, { orgId: string; organization: OrganizationUpdate }>>} [params.options] - Mutation options
 * @returns Mutation result with status and handlers
 *
 * @example
 * ```typescript
 * const { mutate: executeUpdateOrganization, isLoading } = useUpdateOrganization({
 *   supabase,
 *   options: {
 *     onSuccess: (updatedOrg) => {
 *       console.log('Organization updated:', updatedOrg);
 *     },
 *   },
 * });
 *
 * executeUpdateOrganization({ orgId: '123', organization: { name: 'Updated Name' } });
 * ```
 */
export function useUpdateOrganization({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      Organization,
      OrganizationOperationError,
      { orgId: string; organization: OrganizationUpdate }
    >
  >;
}): UseMutationResult<
  Organization,
  OrganizationOperationError,
  { orgId: string; organization: OrganizationUpdate }
> {
  const queryClient = useQueryClient();
  return useMutation<
    Organization,
    OrganizationOperationError,
    { orgId: string; organization: OrganizationUpdate }
  >({
    mutationFn: async ({ orgId, organization }) =>
      updateOrganization({ supabase, orgId, organization }),
    onSuccess: (data, variables, ctx) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(variables.orgId),
      });
      queryClient.invalidateQueries({
        queryKey: organizationKeys.lists(),
      });
      moduleToast.success("Organization updated successfully!");
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
 * Hook for deleting an organization by ID, with toast notifications.
 *
 * @param {object} params - Hook parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseMutationOptions<void, OrganizationOperationError, { orgId: string }>>} [params.options] - Mutation options
 * @returns Mutation result with status and handlers
 *
 * @example
 * ```typescript
 * const { mutate: executeDeleteOrganization, isLoading } = useDeleteOrganization({
 *   supabase,
 *   options: {
 *     onSuccess: () => {
 *       console.log('Organization deleted');
 *     },
 *   },
 * });
 *
 * executeDeleteOrganization({ orgId: '123' });
 * ```
 */
export function useDeleteOrganization({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<void, OrganizationOperationError, { orgId: string }>
  >;
}): UseMutationResult<void, OrganizationOperationError, { orgId: string }> {
  const queryClient = useQueryClient();
  return useMutation<void, OrganizationOperationError, { orgId: string }>({
    mutationFn: async ({ orgId }) => deleteOrganization({ supabase, orgId }),
    onSuccess: (_, variables, ctx) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(variables.orgId),
      });
      queryClient.invalidateQueries({
        queryKey: organizationKeys.lists(),
      });
      moduleToast.success("Organization deleted successfully!");
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
