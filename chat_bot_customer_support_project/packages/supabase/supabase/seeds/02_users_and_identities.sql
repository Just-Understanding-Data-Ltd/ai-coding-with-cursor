/*
02_users_and_identities.sql
Insert test users into auth.users, then insert identities for the users into auth.identities.
*/

/* Test Users */
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
    -- User for team admin with no teams
    (
        '00000000-0000-0000-0000-000000000000',
        '11111111-1111-1111-1111-111111111111',
        'authenticated',
        'authenticated',
        'team.admin-no-members@example.com',
        crypt('password123', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"sub": "11111111-1111-1111-1111-111111111111", "email": "team.admin-no-members@example.com", "email_verified": true, "phone_verified": false}'::jsonb,
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    ),
    -- New team admin user for Multi-Team Organization
    (
        '00000000-0000-0000-0000-000000000000',
        '30303030-3030-3030-3030-303030303030',
        'authenticated',
        'authenticated',
        'team.admin@example.com',
        crypt('password123', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"sub": "30303030-3030-3030-3030-303030303030", "email": "team.admin@example.com", "email_verified": true, "phone_verified": false}'::jsonb,
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    ),
    -- Regular team member for Multi-Team Organization
    (
        '00000000-0000-0000-0000-000000000000',
        '22222222-2222-2222-2222-222222222222',
        'authenticated',
        'authenticated',
        'team.member@example.com',
        crypt('password123', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"sub": "22222222-2222-2222-2222-222222222222", "email": "team.member@example.com", "email_verified": true, "phone_verified": false}'::jsonb,
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    ),
    -- Mixed role user for Multi-Team Organization
    (
        '00000000-0000-0000-0000-000000000000',
        '99999999-9999-9999-9999-999999999999',
        'authenticated',
        'authenticated',
        'mixed.user@example.com',
        crypt('password123', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"sub": "99999999-9999-9999-9999-999999999999", "email": "mixed.user@example.com", "email_verified": true, "phone_verified": false}'::jsonb,
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    ),
    -- Client Organization admin user
    (
        '00000000-0000-0000-0000-000000000000',
        '33333333-3333-3333-3333-333333333333',
        'authenticated',
        'authenticated',
        'client.admin@example.com',
        crypt('password123', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"sub": "33333333-3333-3333-3333-333333333333", "email": "client.admin@example.com", "email_verified": true, "phone_verified": false}'::jsonb,
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    ),
    -- Client Organization member user
    (
        '00000000-0000-0000-0000-000000000000',
        '44444444-4444-4444-4444-444444444444',
        'authenticated',
        'authenticated',
        'client.member@example.com',
        crypt('password123', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"sub": "44444444-4444-4444-4444-444444444444", "email": "client.member@example.com", "email_verified": true, "phone_verified": false}'::jsonb,
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    ),
    -- Internal team admin for Client Organization team
    (
        '00000000-0000-0000-0000-000000000000',
        '77777777-7777-7777-7777-777777777777',
        'authenticated',
        'authenticated',
        'internal.team.admin@example.com',
        crypt('password123', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"sub": "77777777-7777-7777-7777-777777777777", "email": "internal.team.admin@example.com", "email_verified": true, "phone_verified": false}'::jsonb,
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    ),
    -- Internal team member for Client Organization team
    (
        '00000000-0000-0000-0000-000000000000',
        '88888888-8888-8888-8888-888888888888',
        'authenticated',
        'authenticated',
        'internal.team.member@example.com',
        crypt('password123', gen_salt('bf')),
        current_timestamp,
        current_timestamp,
        current_timestamp,
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"sub": "88888888-8888-8888-8888-888888888888", "email": "internal.team.member@example.com", "email_verified": true, "phone_verified": false}'::jsonb,
        current_timestamp,
        current_timestamp,
        '',
        '',
        '',
        ''
    )
ON CONFLICT (id) DO NOTHING;

/* Insert identities for the users */
INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
(
    SELECT
        uuid_generate_v4(),
        id,
        id,
        format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
        'email',
        current_timestamp,
        current_timestamp,
        current_timestamp
    FROM auth.users
)
ON CONFLICT (provider_id, provider) DO NOTHING; 