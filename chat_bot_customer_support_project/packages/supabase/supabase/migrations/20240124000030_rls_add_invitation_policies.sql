-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admins to view invitations" ON invitations;
DROP POLICY IF EXISTS "Allow admins to create invitations" ON invitations;
DROP POLICY IF EXISTS "Allow admins to update invitations" ON invitations;
DROP POLICY IF EXISTS "Allow admins to delete invitations" ON invitations;

-- Create policies for invitations table
CREATE POLICY "Allow admins to view invitations"
ON invitations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = invitations.organization_id
    AND om.user_id = auth.uid()
    AND (
      -- Organization admin check
      EXISTS (
        SELECT 1 FROM role_permissions rp
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = om.role_id
        AND p.action = 'manage_organization'
      )
      OR
      -- Team admin check (for team-specific invitations)
      (
        invitations.team_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM team_members tm
          JOIN role_permissions rp ON rp.role_id = tm.role_id
          JOIN public.permissions p ON p.id = rp.permission_id
          WHERE tm.team_id = invitations.team_id
          AND tm.user_id = auth.uid()
          AND p.action = 'manage_team_members'
        )
      )
    )
  )
);

CREATE POLICY "Allow admins to create invitations"
ON invitations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = invitations.organization_id
    AND om.user_id = auth.uid()
    AND (
      -- Organization admin check
      EXISTS (
        SELECT 1 FROM role_permissions rp
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = om.role_id
        AND p.action = 'manage_organization'
      )
      OR
      -- Team admin check (for team-specific invitations)
      (
        invitations.team_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM team_members tm
          JOIN role_permissions rp ON rp.role_id = tm.role_id
          JOIN public.permissions p ON p.id = rp.permission_id
          WHERE tm.team_id = invitations.team_id
          AND tm.user_id = auth.uid()
          AND p.action = 'manage_team_members'
        )
      )
    )
  )
);

CREATE POLICY "Allow admins to update invitations"
ON invitations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = invitations.organization_id
    AND om.user_id = auth.uid()
    AND (
      -- Organization admin check
      EXISTS (
        SELECT 1 FROM role_permissions rp
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = om.role_id
        AND p.action = 'manage_organization'
      )
      OR
      -- Team admin check (for team-specific invitations)
      (
        invitations.team_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM team_members tm
          JOIN role_permissions rp ON rp.role_id = tm.role_id
          JOIN public.permissions p ON p.id = rp.permission_id
          WHERE tm.team_id = invitations.team_id
          AND tm.user_id = auth.uid()
          AND p.action = 'manage_team_members'
        )
      )
    )
  )
);

CREATE POLICY "Allow admins to delete invitations"
ON invitations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = invitations.organization_id
    AND om.user_id = auth.uid()
    AND (
      -- Organization admin check
      EXISTS (
        SELECT 1 FROM role_permissions rp
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = om.role_id
        AND p.action = 'manage_organization'
      )
      OR
      -- Team admin check (for team-specific invitations)
      (
        invitations.team_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM team_members tm
          JOIN role_permissions rp ON rp.role_id = tm.role_id
          JOIN public.permissions p ON p.id = rp.permission_id
          WHERE tm.team_id = invitations.team_id
          AND tm.user_id = auth.uid()
          AND p.action = 'manage_team_members'
        )
      )
    )
  )
); 