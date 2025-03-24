-- Drop existing policies
DROP POLICY IF EXISTS "team_members_view" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete" ON public.team_members;

-- Create new team member policies using helper functions
CREATE POLICY "team_members_view" ON public.team_members
    FOR SELECT TO authenticated
    USING (
      -- User must be in the org to see team members
      is_org_member((SELECT organization_id FROM teams WHERE id = team_id))
    );

CREATE POLICY "team_members_insert" ON public.team_members
    FOR INSERT TO authenticated
    WITH CHECK (
      -- Must have team-level manage_team_members permission OR org-level manage_organization permission
      has_team_permission(team_id, 'manage_team_members'::permission_action)
      OR has_org_permission(
        (SELECT organization_id FROM teams WHERE id = team_id),
        'manage_organization'::permission_action
      )
    );

CREATE POLICY "team_members_update" ON public.team_members
    FOR UPDATE TO authenticated
    USING (
      has_team_permission(team_id, 'manage_team_members'::permission_action)
      OR has_org_permission(
        (SELECT organization_id FROM teams WHERE id = team_id),
        'manage_organization'::permission_action
      )
    )
    WITH CHECK (
      has_team_permission(team_id, 'manage_team_members'::permission_action)
      OR has_org_permission(
        (SELECT organization_id FROM teams WHERE id = team_id),
        'manage_organization'::permission_action
      )
    );

CREATE POLICY "team_members_delete" ON public.team_members
    FOR DELETE TO authenticated
    USING (
      has_team_permission(team_id, 'manage_team_members'::permission_action)
      OR has_org_permission(
        (SELECT organization_id FROM teams WHERE id = team_id),
        'manage_organization'::permission_action
      )
    );

-- Create policy for service role to have full access to team_members
CREATE POLICY "team_members_service_role" ON public.team_members
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true); 