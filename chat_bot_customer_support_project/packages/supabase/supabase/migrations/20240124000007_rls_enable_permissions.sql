-- Disable RLS on permission-related tables (they should be read-only and accessible)
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;

-- Grant read-only access to authenticated users
REVOKE ALL ON roles FROM authenticated;
REVOKE ALL ON permissions FROM authenticated;
REVOKE ALL ON role_permissions FROM authenticated;

GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;