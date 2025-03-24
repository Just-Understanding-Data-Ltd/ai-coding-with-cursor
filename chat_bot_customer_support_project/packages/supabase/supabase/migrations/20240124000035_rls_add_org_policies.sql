-- Drop existing policies
DROP POLICY IF EXISTS "organizations_view" ON public.organizations;
DROP POLICY IF EXISTS "organizations_update" ON public.organizations;
DROP POLICY IF EXISTS "organizations_insert" ON public.organizations;

-- Create new organization policies using helper functions
CREATE POLICY "organizations_view" ON public.organizations
    FOR SELECT TO authenticated
    USING (
      is_org_member(id)  -- user must be in the org to see it
    );

CREATE POLICY "organizations_update" ON public.organizations
    FOR UPDATE TO authenticated
    USING (
      has_org_permission(id, 'manage_organization'::permission_action)
    )
    WITH CHECK (
      has_org_permission(id, 'manage_organization'::permission_action)
    );

-- Allow authenticated users to create organizations
CREATE POLICY "organizations_insert" ON public.organizations
    FOR INSERT TO authenticated
    WITH CHECK (true);  -- Any authenticated user can create an organization 