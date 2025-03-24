/*
04_organization_members.sql
Inserts organization membership info (linking users to organizations).
*/

/* Multi-Team Organization Members */
INSERT INTO organization_members (organization_id, user_id, role_id, membership_type) VALUES
    -- Commented out to ensure this user doesn't get added to a team (No Teams scenario):
    -- ('11111111-2222-3333-4444-555555555555', '11111111-1111-1111-1111-111111111111', (SELECT id FROM roles WHERE name = 'admin'), 'team'),
    -- New team admin user
    ('11111111-2222-3333-4444-555555555555', '30303030-3030-3030-3030-303030303030', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1), 'team'),
    -- Regular team member
    ('11111111-2222-3333-4444-555555555555', '22222222-2222-2222-2222-222222222222', (SELECT id FROM roles WHERE name = 'member' LIMIT 1), 'team'),
    -- Mixed role user (member in one team, admin in another)
    ('11111111-2222-3333-4444-555555555555', '99999999-9999-9999-9999-999999999999', (SELECT id FROM roles WHERE name = 'member' LIMIT 1), 'team')
ON CONFLICT (organization_id, user_id) DO NOTHING;

/* No-Teams Organization Members */
INSERT INTO organization_members (organization_id, user_id, role_id, membership_type) VALUES
    ('22222222-3333-4444-5555-666666666666', '11111111-1111-1111-1111-111111111111', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1), 'team');

/* Client Organization Members (mixed membership types) */
INSERT INTO organization_members (organization_id, user_id, role_id, membership_type) VALUES
    -- Client members
    ('33333333-4444-5555-6666-777777777777', '33333333-3333-3333-3333-333333333333', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1), 'client'),
    ('33333333-4444-5555-6666-777777777777', '44444444-4444-4444-4444-444444444444', (SELECT id FROM roles WHERE name = 'member' LIMIT 1), 'client'),
    -- Internal team members managing the client
    ('33333333-4444-5555-6666-777777777777', '77777777-7777-7777-7777-777777777777', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1), 'team'),
    ('33333333-4444-5555-6666-777777777777', '88888888-8888-8888-8888-888888888888', (SELECT id FROM roles WHERE name = 'member' LIMIT 1), 'team')
ON CONFLICT (organization_id, user_id) DO NOTHING; 