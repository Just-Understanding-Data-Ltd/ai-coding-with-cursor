-- Drop existing policies
DROP POLICY IF EXISTS "organization_members_view" ON public.organization_members;
DROP POLICY IF EXISTS "organization_members_insert" ON public.organization_members;
DROP POLICY IF EXISTS "organization_members_update" ON public.organization_members;
DROP POLICY IF EXISTS "organization_members_delete" ON public.organization_members;

-- Create policies for organization_members using direct organization ID check
CREATE POLICY "organization_members_view" ON public.organization_members
    FOR SELECT TO authenticated
    USING (
    user_id = auth.uid() OR is_org_member(organization_id)
    );

CREATE POLICY "organization_members_insert" ON public.organization_members
    FOR INSERT TO authenticated
    WITH CHECK (
      has_org_permission(organization_id, 'manage_organization_members'::permission_action)
      OR NOT EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = organization_id
      )
    );

CREATE POLICY "organization_members_update" ON public.organization_members
    FOR UPDATE TO authenticated
    USING (
      has_org_permission(organization_id, 'manage_organization_members'::permission_action)
    )
    WITH CHECK (
      has_org_permission(organization_id, 'manage_organization_members'::permission_action)
    );

CREATE POLICY "organization_members_delete" ON public.organization_members
    FOR DELETE TO authenticated
    USING (
      has_org_permission(organization_id, 'manage_organization_members'::permission_action)
    );

-- Create policy for service role to have full access to organization_members
CREATE POLICY "organization_members_service_role" ON public.organization_members
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true); 