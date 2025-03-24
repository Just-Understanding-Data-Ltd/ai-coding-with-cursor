-- Expand permission actions to cover all necessary operations
CREATE TYPE permission_action AS ENUM (
    -- Comment & DM Management
    'view_comments_and_dms',
    'manage_comments_and_dms',
    
    -- Email Management
    'manage_email_inbox',
    
    -- Integration Management
    'manage_connected_pages',
    'manage_integrations',
    
    -- Post Management
    'create_posts',
    'edit_posts',
    'delete_posts',
    'view_posts',
    'schedule_posts',
    
    -- Media Management
    'upload_media',
    'manage_media_library',
    
    -- Analytics
    'view_analytics',
    'export_analytics',
    
    -- Team Management
    'manage_team_members',
    'assign_roles',
    
    -- Admin Actions
    'manage_organization',
    'manage_organization_members',
    'manage_billing'
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    action permission_action NOT NULL
);

INSERT INTO permissions (name, description, action) VALUES
    -- Comment & DM Management
    ('View Comments & DMs', 'Ability to view comments and direct messages', 'view_comments_and_dms'),
    ('Manage Comments & DMs', 'Ability to manage comments and direct messages', 'manage_comments_and_dms'),
    
    -- Email Management
    ('Manage Email Inbox', 'Ability to manage email inbox', 'manage_email_inbox'),
    
    -- Integration Management
    ('Manage Connected Pages', 'Ability to manage connected social media pages', 'manage_connected_pages'),
    ('Manage Integrations', 'Ability to manage platform integrations', 'manage_integrations'),
    
    -- Post Management
    ('Create Posts', 'Ability to create new posts', 'create_posts'),
    ('Edit Posts', 'Ability to edit posts', 'edit_posts'),
    ('Delete Posts', 'Ability to delete posts', 'delete_posts'),
    ('View Posts', 'Ability to view posts', 'view_posts'),
    ('Schedule Posts', 'Ability to schedule posts', 'schedule_posts'),
    
    -- Media Management
    ('Upload Media', 'Ability to upload media files', 'upload_media'),
    ('Manage Media Library', 'Ability to manage media library', 'manage_media_library'),
    
    -- Analytics
    ('View Analytics', 'Ability to view analytics', 'view_analytics'),
    ('Export Analytics', 'Ability to export analytics data', 'export_analytics'),
    
    -- Team Management
    ('Manage Team Members', 'Ability to manage team members', 'manage_team_members'),
    ('Assign Roles', 'Ability to assign roles to team members', 'assign_roles'),
    
    -- Admin Actions
    ('Manage Organization', 'Full organization management privileges', 'manage_organization'),
    ('Manage Organization Members', 'Ability to manage organization members', 'manage_organization_members'),
    ('Manage Billing', 'Full billing management privileges', 'manage_billing');