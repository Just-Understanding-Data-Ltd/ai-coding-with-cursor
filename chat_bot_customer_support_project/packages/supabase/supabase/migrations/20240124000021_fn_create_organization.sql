CREATE OR REPLACE FUNCTION create_organization(
    p_name TEXT,
    p_billing_email TEXT,
    p_user_id TEXT,
    p_team_name TEXT,
    p_onboarding_role onboarding_role_type,
    p_goals organization_goal[],
    p_team_website TEXT DEFAULT NULL,
    p_referral_source organization_referral_source DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org public.organizations;
    v_team public.teams;
    v_admin_role_id UUID;
BEGIN
    -- Get the admin role ID
    SELECT id INTO v_admin_role_id
    FROM roles
    WHERE name = 'admin';

    -- Insert the organization with onboarding data
    INSERT INTO public.organizations (
        name,
        billing_email,
        onboarding_data
    )
    VALUES (
        p_name,
        p_billing_email,
        jsonb_build_object(
            'onboarding_role', p_onboarding_role,
            'goals', to_jsonb(p_goals),
            'referral_source', p_referral_source
        )
    )
    RETURNING * INTO v_org;

    -- Insert the admin member
    INSERT INTO public.organization_members (
        organization_id,
        user_id,
        role_id,
        membership_type
    )
    VALUES (
        v_org.id,
        p_user_id::uuid,
        v_admin_role_id,
        'team'
    );

    -- Create initial team
    INSERT INTO public.teams (
        organization_id,
        name,
        website
    )
    VALUES (
        v_org.id,
        p_team_name,
        p_team_website
    )
    RETURNING * INTO v_team;

    RETURN jsonb_build_object(
        'organization', v_org,
        'team', v_team
    );
END;
$$;

GRANT EXECUTE ON FUNCTION create_organization TO authenticated;