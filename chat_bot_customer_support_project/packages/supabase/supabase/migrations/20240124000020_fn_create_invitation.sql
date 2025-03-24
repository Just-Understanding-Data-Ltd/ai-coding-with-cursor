-- Create invitation related functions
CREATE OR REPLACE FUNCTION public.invite_org_member(
    p_organization_id UUID,
    p_membership_type membership_type,
    p_email TEXT,
    p_role_id UUID,
    p_invited_by UUID,
    p_expires_at TIMESTAMP WITH TIME ZONE,
    p_team_id UUID DEFAULT NULL
)
RETURNS TEXT  -- Return the token
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
     v_token UUID := uuid_generate_v4();
BEGIN
    INSERT INTO invitations (
        email,
        organization_id,
        role_id,
        membership_type,
        invited_by,
        token,
        expires_at,
        team_id
    ) VALUES (
        p_email,
        p_organization_id,
        p_role_id,
        p_membership_type,
        p_invited_by,
        v_token::text,
        p_expires_at,
        p_team_id
    );

    RETURN v_token;
END;
$$;

-- Create function to validate invitation token
CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    organization_id UUID,
    role_id UUID,
    role_name TEXT,
    membership_type membership_type,
    expires_at TIMESTAMP WITH TIME ZONE,
    organizations jsonb
) SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.email,
        i.organization_id,
        i.role_id,
        r.name as role_name,
        i.membership_type,
        i.expires_at,
        jsonb_build_object(
            'name', o.name
        ) as organizations
    FROM invitations i
    JOIN organizations o ON o.id = i.organization_id
    JOIN roles r ON r.id = i.role_id
    WHERE i.token = p_token
    AND i.accepted_at IS NULL
    AND i.expires_at > NOW();
END;
$$;

-- Create function to revoke invitation
CREATE OR REPLACE FUNCTION public.revoke_invitation(
         p_token TEXT
     )
     RETURNS BOOLEAN
     LANGUAGE plpgsql
     SECURITY DEFINER
     AS $$
     BEGIN
         DELETE FROM invitations
         WHERE token = p_token
           AND accepted_at IS NULL;

         IF NOT FOUND THEN
             RETURN FALSE;
         END IF;

         RETURN TRUE;
     END;
     $$;

-- Create function to process invitation
CREATE OR REPLACE FUNCTION process_invitation(
    p_token TEXT,
    p_user_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_invitation invitations%ROWTYPE;
BEGIN
    -- Get and validate invitation
    SELECT * INTO v_invitation
    FROM invitations
    WHERE token = p_token
      AND accepted_at IS NULL
      AND expires_at > NOW();

    IF v_invitation IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Always ensure user is in the organisation (with the relevant role)
    INSERT INTO organization_members (
        organization_id,
        user_id,
        role_id,
        membership_type
    )
    VALUES (
        v_invitation.organization_id,
        p_user_id,
        v_invitation.role_id,
        v_invitation.membership_type
    )
    ON CONFLICT (organization_id, user_id)
    DO UPDATE SET role_id = EXCLUDED.role_id;

    -- If the invitation has a team_id, only add them to that team
    IF v_invitation.team_id IS NOT NULL THEN
        INSERT INTO team_members (
            team_id,
            user_id,
            role_id
        )
        VALUES (
            v_invitation.team_id,
            p_user_id,
            v_invitation.role_id
        )
        ON CONFLICT (team_id, user_id)
        DO UPDATE SET role_id = EXCLUDED.role_id;
    ELSE
        -- Add user to all teams if no specific team
        INSERT INTO team_members (team_id, user_id, role_id)
        SELECT
            t.id,
            p_user_id,
            v_invitation.role_id
        FROM teams t
        WHERE t.organization_id = v_invitation.organization_id
        ON CONFLICT (team_id, user_id)
        DO UPDATE SET role_id = EXCLUDED.role_id;
    END IF;

    -- Mark invitation as accepted
    UPDATE invitations
    SET accepted_at = NOW()
    WHERE id = v_invitation.id;

    RETURN TRUE;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION invite_org_member TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION validate_invitation_token TO anon, authenticated;
GRANT EXECUTE ON FUNCTION process_invitation TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION revoke_invitation TO authenticated, service_role; 