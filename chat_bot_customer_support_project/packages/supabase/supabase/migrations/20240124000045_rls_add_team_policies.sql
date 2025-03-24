-- Drop existing policies
DROP POLICY IF EXISTS "teams_view" ON public.teams;
DROP POLICY IF EXISTS "teams_insert" ON public.teams;
DROP POLICY IF EXISTS "teams_update" ON public.teams;
DROP POLICY IF EXISTS "teams_delete" ON public.teams;

-- Create new team policies using helper functions
CREATE POLICY "teams_view" ON public.teams
    FOR SELECT TO authenticated
    USING (
      is_org_member(organization_id)  -- user must be in the org to see its teams
    );

CREATE POLICY "teams_insert" ON public.teams
    FOR INSERT TO authenticated
    WITH CHECK (
      -- Must have manage_organization permission to create teams
      has_org_permission(organization_id, 'manage_organization'::permission_action)
    );

CREATE POLICY "teams_update" ON public.teams
    FOR UPDATE TO authenticated
    USING (
      has_org_permission(organization_id, 'manage_organization'::permission_action)
    )
    WITH CHECK (
        has_org_permission(organization_id, 'manage_organization'::permission_action)
    );

CREATE POLICY "teams_delete" ON public.teams
    FOR DELETE TO authenticated
    USING (
      has_org_permission(organization_id, 'manage_organization'::permission_action)
    );

-- Create policy for service role to have full access to teams
CREATE POLICY "teams_service_role" ON public.teams
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true); 