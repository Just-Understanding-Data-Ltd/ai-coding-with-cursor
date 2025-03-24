"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { SupabaseClient } from "../index";
import { type RoleData, getRoles, RoleOperationError } from "./roles";

type QueryKey = readonly [string, ...unknown[]];

/**
 * React Query key factory for role-related queries
 */
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as QueryKey,
} as const;

/**
 * Hook for fetching all roles.
 *
 * @param {object} params - Hook parameters
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseQueryOptions<RoleData[], RoleOperationError>>} [params.options] - Additional React Query options
 * @returns Query result with data and error
 *
 * @example
 * ```typescript
 * const { data: roles, isLoading, error } = useRoles({ supabase });
 * ```
 */
export function useRoles({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<RoleData[], RoleOperationError>>;
}) {
  return useQuery<RoleData[], RoleOperationError>({
    queryKey: roleKeys.lists(),
    queryFn: async () => getRoles({ supabase }),
    ...options,
  });
}

export type { RoleData };
