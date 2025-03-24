-- Create helper functions for RLS policies to avoid self-referencing issues
-- These SECURITY DEFINER functions bypass RLS on the underlying tables

-- Check if a user is a member of an organization
CREATE OR REPLACE FUNCTION is_org_member(_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = _org_id
    AND om.user_id = auth.uid()
  );
$$;

-- Check if a user has a specific organization-level permission
CREATE OR REPLACE FUNCTION has_org_permission(
  _org_id uuid,
  _permission_action permission_action
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    JOIN public.roles r ON r.id = om.role_id
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE om.organization_id = _org_id
      AND om.user_id = auth.uid()
      AND p.action = _permission_action
  )
  INTO v_exists;
  RETURN v_exists;
END;
$$;

-- Check if a user has a specific team-level permission
CREATE OR REPLACE FUNCTION has_team_permission(
  _team_id uuid,
  _permission_action permission_action
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.teams t
    JOIN public.organization_members om ON om.organization_id = t.organization_id
    JOIN public.roles r ON r.id = om.role_id
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions p ON p.id = rp.permission_id
    -- Also check team_members for specifically team-based permissions
    LEFT JOIN public.team_members tm ON tm.team_id = t.id AND tm.user_id = auth.uid()
    LEFT JOIN public.roles tr ON tr.id = tm.role_id
    LEFT JOIN public.role_permissions trp ON trp.role_id = tr.id
    LEFT JOIN public.permissions tp ON tp.id = trp.permission_id
    WHERE t.id = _team_id
      AND om.user_id = auth.uid()
      AND (
        p.action = _permission_action
        OR tp.action = _permission_action
      )
  )
  INTO v_exists;
  RETURN v_exists;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_org_member TO authenticated;
GRANT EXECUTE ON FUNCTION has_org_permission TO authenticated;
GRANT EXECUTE ON FUNCTION has_team_permission TO authenticated; 