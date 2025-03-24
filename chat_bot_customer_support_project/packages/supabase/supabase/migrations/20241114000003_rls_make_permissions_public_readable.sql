-- First, ensure RLS is enabled for all permissions tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "roles_public_read" ON roles;
DROP POLICY IF EXISTS "permissions_public_read" ON permissions;
DROP POLICY IF EXISTS "role_permissions_public_read" ON role_permissions;

-- Create policies to allow reading by anyone (including anonymous users)
CREATE POLICY "roles_public_read" 
ON roles
FOR SELECT 
TO PUBLIC
USING (true);

CREATE POLICY "permissions_public_read" 
ON permissions
FOR SELECT 
TO PUBLIC
USING (true);

CREATE POLICY "role_permissions_public_read" 
ON role_permissions
FOR SELECT 
TO PUBLIC
USING (true);

-- Grant SELECT permissions to both authenticated and anonymous users
GRANT SELECT ON roles TO authenticated, anon;
GRANT SELECT ON permissions TO authenticated, anon;
GRANT SELECT ON role_permissions TO authenticated, anon;

-- Note: This keeps these tables read-only for regular users
-- Only service_role and postgres roles can make modifications 