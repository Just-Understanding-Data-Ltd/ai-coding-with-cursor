"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { SupabaseClient } from "@repo/supabase";
import {
  getMemberRoles,
  memberRolesKeys,
  MemberRoleOperationError,
} from "../actions/get-member-roles";
import { MemberRolesResponse } from "@repo/supabase";

/**
 * Hook for fetching all roles and permissions for a user across organizations and teams.
 *
 * @param {object} params - Hook parameters
 * @param {string} params.userId - The ID of the user to fetch roles for
 * @param {SupabaseClient} params.supabase - Supabase client instance
 * @param {Partial<UseQueryOptions<MemberRolesResponse, MemberRoleOperationError>>} [params.options] - Additional React Query options
 * @returns {UseQueryResult<MemberRolesResponse>} Object containing both organization and team memberships with their roles and permissions
 *
 * @example
 * ```typescript
 * const { data: roles, isLoading, error } = useMemberRoles({
 *   userId: 'user-123',
 *   supabase
 * });
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error error={error} />;
 *
 * // Access organization memberships
 * roles.organizationMemberships.forEach(membership => {
 *   console.log('Organization Role:', membership.role.name);
 *   console.log('Permissions:', membership.role.permissions);
 * });
 *
 * // Access team memberships
 * roles.teamMemberships.forEach(membership => {
 *   console.log('Team Role:', membership.role.name);
 *   console.log('Permissions:', membership.role.permissions);
 * });
 * ```
 */
export function useMemberRoles({
  userId,
  supabase,
  options = {},
}: {
  userId: string;
  supabase: SupabaseClient;
  options?: Partial<
    UseQueryOptions<MemberRolesResponse, MemberRoleOperationError>
  >;
}) {
  return useQuery<MemberRolesResponse, MemberRoleOperationError>({
    queryKey: memberRolesKeys.user(userId),
    queryFn: () => getMemberRoles({ supabase, userId }),
    ...options,
  });
}
