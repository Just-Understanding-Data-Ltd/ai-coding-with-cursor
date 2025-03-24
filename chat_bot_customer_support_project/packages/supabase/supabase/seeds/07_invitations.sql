/* Test Invitations */
INSERT INTO invitations (id, email, organization_id, team_id, role_id, membership_type, invited_by, token, expires_at) VALUES
-- Expired invitation
(
    '11111111-1111-1111-1111-111111111111',
    'expired@example.com',
    '11111111-2222-3333-4444-555555555555',
    NULL, -- No team_id for team membership type
    (SELECT id FROM roles WHERE name = 'member' LIMIT 1),
    'team',
    '11111111-1111-1111-1111-111111111111',
    'expired-token',
    now() - interval '7 days'
),
-- Valid invitation for new user (team)
(
    '22222222-2222-2222-2222-222222222222',
    'new.user@example.com',
    '11111111-2222-3333-4444-555555555555',
    NULL, -- No team_id for team membership type
    (SELECT id FROM roles WHERE name = 'member' LIMIT 1),
    'team',
    '11111111-1111-1111-1111-111111111111',
    'valid-new-user-token',
    now() + interval '30 days'
),
-- Second Valid invitation for new user (team)
(
    '33333333-3333-3333-3333-333333333334',
    'new.user.team@example.com',
    '11111111-2222-3333-4444-555555555555',
    NULL, -- No team_id for team membership type
    (SELECT id FROM roles WHERE name = 'member' LIMIT 1),
    'team',
    '11111111-1111-1111-1111-111111111111',
    'valid-new-user-token-team',
    now() + interval '30 days'
),
-- Valid invitation for existing user (team)
(
    '33333333-3333-3333-3333-333333333333',
    'existing.user.team@example.com',
    '11111111-2222-3333-4444-555555555555',
    NULL, -- No team_id for team membership type
    (SELECT id FROM roles WHERE name = 'member' LIMIT 1),
    'team',
    '11111111-1111-1111-1111-111111111111',
    'valid-existing-user-token-team',
    now() + interval '30 days'
),
-- Valid invitation for new user (existing sign in flow)
(
    '44444444-4444-4444-4444-444444444444',
    'new.user.existingsignin@example.com',
    '11111111-2222-3333-4444-555555555555',
    NULL, -- No team_id for team membership type
    (SELECT id FROM roles WHERE name = 'member' LIMIT 1),
    'team',
    '11111111-1111-1111-1111-111111111111',
    'valid-new-user-existingsignin-token',
    now() + interval '30 days'
),
-- Valid invitation for new user (client) - inviting to Client Success Team
(
    '55555555-5555-5555-5555-555555555555',
    'new.user@example.com',
    '33333333-4444-5555-6666-777777777777',
    '77777777-8888-9999-aaaa-bbbbbbbbbbbb', -- Client Success Team
    (SELECT id FROM roles WHERE name = 'member' LIMIT 1),
    'client',
    '33333333-3333-3333-3333-333333333333',
    'valid-new-user-token-client',
    now() + interval '30 days'
),
-- Valid invitation for existing user (client) - inviting to Client Projects Team
(
    '66666666-6666-6666-6666-666666666666',
    'existing.user.team@example.com',
    '33333333-4444-5555-6666-777777777777',
    '88888888-9999-aaaa-bbbb-cccccccccccc', -- Client Projects Team
    (SELECT id FROM roles WHERE name = 'member' LIMIT 1),
    'client',
    '33333333-3333-3333-3333-333333333333',
    'valid-existing-user-token-client',
    now() + interval '30 days'
);