/*
06_team_members.sql
Ensures that appropriate users are added to teams (team_members table), then updates specific role assignments.
*/

/* Multi-Team Organization: Ensure all team members are in all teams */
INSERT INTO team_members (team_id, user_id, role_id) 
SELECT t.id, om.user_id, 
    CASE 
        WHEN om.role_id = (SELECT id FROM roles WHERE name = 'admin') THEN om.role_id
        ELSE (SELECT id FROM roles WHERE name = 'member')
    END
FROM teams t
CROSS JOIN organization_members om
WHERE t.organization_id = '11111111-2222-3333-4444-555555555555'
  AND om.organization_id = '11111111-2222-3333-4444-555555555555'
  AND om.membership_type = 'team'
ON CONFLICT (team_id, user_id) DO NOTHING;

/* Client Organization: Ensure ALL members (both client and team membership types) are in all teams */
INSERT INTO team_members (team_id, user_id, role_id)
SELECT t.id, om.user_id,
    CASE 
        WHEN om.role_id = (SELECT id FROM roles WHERE name = 'admin') THEN om.role_id
        ELSE (SELECT id FROM roles WHERE name = 'member')
    END
FROM teams t
CROSS JOIN organization_members om
WHERE t.organization_id = '33333333-4444-5555-6666-777777777777'
  AND om.organization_id = '33333333-4444-5555-6666-777777777777'
ON CONFLICT (team_id, user_id) DO NOTHING;

/* Update specific role assignments */

/* Marketing Team admin role */
UPDATE team_members 
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE team_id = '44444444-5555-6666-7777-888888888888' 
  AND user_id = '11111111-1111-1111-1111-111111111111';

/* Mixed role user as admin in Design Team */
UPDATE team_members 
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE team_id = '55555555-6666-7777-8888-999999999999' 
  AND user_id = '99999999-9999-9999-9999-999999999999';

/* Update Client Success Team admin */
UPDATE team_members 
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE team_id = '77777777-8888-9999-aaaa-bbbbbbbbbbbb' 
  AND user_id = '77777777-7777-7777-7777-777777777777';

/* Ensure client admin has admin role in both teams */
UPDATE team_members 
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE team_id IN (
    '77777777-8888-9999-aaaa-bbbbbbbbbbbb',
    '88888888-9999-aaaa-bbbb-cccccccccccc'
)
  AND user_id = '33333333-3333-3333-3333-333333333333';

/* Add explicit team memberships for new team admin user */
INSERT INTO team_members (team_id, user_id, role_id) VALUES
    -- Marketing Team admin role
    ('44444444-5555-6666-7777-888888888888', '30303030-3030-3030-3030-303030303030', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1)),
    -- Design Team admin role
    ('55555555-6666-7777-8888-999999999999', '30303030-3030-3030-3030-303030303030', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1))
ON CONFLICT (team_id, user_id) DO UPDATE SET role_id = EXCLUDED.role_id; 