CREATE TABLE role_permissions (
    role_id UUID REFERENCES public.roles(id),
    permission_id UUID REFERENCES public.permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

-- Insert permissions for admin role (gets everything)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'admin'),
    id
FROM permissions;

-- Insert permissions for member role (everything except Team Management and Admin Actions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'member'),
    id
FROM permissions
WHERE action NOT IN (
    -- Team Management exclusions
    'manage_team_members',
    'assign_roles',
    
    -- Admin Actions exclusions
    'manage_organization',
    'manage_organization_members',
    'manage_billing'
);

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;