import { faker } from "@faker-js/faker";
import { createAdminClient } from "./utils";
import { createTestRoles } from "./role.factory";
import type { Database } from "../database.types";

type OnboardingRoleType = Database["public"]["Enums"]["onboarding_role_type"];
type OrganizationGoal = Database["public"]["Enums"]["organization_goal"];
type OrganizationReferralSource =
  Database["public"]["Enums"]["organization_referral_source"];

/**
 * Creates a test organization with initial setup.
 *
 * @param {object} params - The parameters for creating an organization
 * @param {string} params.userId - The ID of the user who will be the admin
 * @param {OnboardingRoleType} [params.onboardingRole] - Optional onboarding role (defaults to 'business_owner')
 * @param {boolean} [params.asAdmin] - Optional flag to determine if the user is an admin (defaults to true)
 * @returns {Promise<{ organization: { id: string }, team: { id: string }, roles: { admin: { id: string }, member: { id: string } }}>} The created organization, team, and role IDs
 */
export async function createTestOrganization({
  userId,
  name = faker.company.name(),
  onboardingRole = "business_owner",
  asAdmin = true,
}: {
  userId: string;
  name?: string;
  onboardingRole?: OnboardingRoleType;
  asAdmin?: boolean;
}) {
  // Create admin client for this operation
  const adminClient = createAdminClient();

  // Get roles first
  const roles = await createTestRoles();

  // 1. Create the organization with service role client (bypasses RLS)
  const { data: org, error: orgError } = await adminClient
    .from("organizations")
    .insert({
      name,
      billing_email: faker.internet.email(),
      onboarding_data: {
        onboarding_role: onboardingRole,
        goals: [
          "customer_support",
          "personalized_responses",
        ] as OrganizationGoal[],
        referral_source: "google_search" as OrganizationReferralSource,
      },
    })
    .select()
    .single();

  if (orgError) throw orgError;
  if (!org) throw new Error("No organization data returned after insert");

  // 2. Create the organization member; use role based on asAdmin flag
  const { data: orgMember, error: memberError } = await adminClient
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: userId,
      role_id: asAdmin ? roles.admin.id : roles.member.id,
      membership_type: "team",
    })
    .select()
    .single();

  if (memberError) throw memberError;
  if (!orgMember)
    throw new Error("No organization member data returned after insert");

  // 3. Create the team
  const { data: team, error: teamError } = await adminClient
    .from("teams")
    .insert({
      organization_id: org.id,
      name: `${name} Team`,
    })
    .select()
    .single();

  if (teamError) throw teamError;
  if (!team) throw new Error("No team data returned after insert");

  // 4. Check if team member already exists (due to triggers)
  const { data: existingTeamMember } = await adminClient
    .from("team_members")
    .select()
    .match({ team_id: team.id, user_id: userId })
    .single();

  // If team member doesn't exist, create it
  if (!existingTeamMember) {
    const { data: teamMember, error: teamMemberError } = await adminClient
      .from("team_members")
      .insert({
        team_id: team.id,
        user_id: userId,
        role_id: asAdmin ? roles.admin.id : roles.member.id,
      })
      .select()
      .single();

    if (teamMemberError) throw teamMemberError;
    if (!teamMember)
      throw new Error("No team member data returned after insert");
  }

  return {
    organization: { id: org.id },
    team: { id: team.id },
    roles,
  };
}
