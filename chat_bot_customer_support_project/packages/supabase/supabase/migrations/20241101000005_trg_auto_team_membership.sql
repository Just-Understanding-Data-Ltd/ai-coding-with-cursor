CREATE OR REPLACE FUNCTION add_internal_team_member_to_all_teams()
RETURNS TRIGGER AS $$
DECLARE
    v_role_id UUID;
    v_membership_type membership_type;
    v_organization_id UUID;
    v_is_initial_setup BOOLEAN;
BEGIN
    -- Check if this is part of initial organization setup
    IF TG_TABLE_NAME = 'organization_members' THEN
        SELECT EXISTS (
            SELECT 1 
            FROM teams t 
            WHERE t.organization_id = NEW.organization_id
            LIMIT 1
        ) INTO v_is_initial_setup;
        
        -- Skip if this is the first member during org creation
        IF NOT v_is_initial_setup THEN
            RETURN NEW;
        END IF;
    END IF;

    -- Handle different trigger sources (org_members vs teams)
    IF TG_TABLE_NAME = 'organization_members' THEN
        v_membership_type := NEW.membership_type;
        v_organization_id := NEW.organization_id;
    ELSE -- teams table
        v_membership_type := 'team'; -- Default for team triggers
        v_organization_id := NEW.organization_id;
    END IF;

    -- Get the role ID based on the organization member's role
    IF TG_TABLE_NAME = 'organization_members' THEN
        SELECT 
            CASE 
                WHEN r.name = 'admin' THEN r.id
                ELSE (SELECT id FROM roles WHERE name = 'member')
            END INTO v_role_id
        FROM organization_members om
        JOIN roles r ON r.id = om.role_id
        WHERE om.id = NEW.id;
    ELSE
        -- For team triggers, get all org members with their roles
        NULL; -- No role needed for team creation
    END IF;

    -- Handle organization member insertion (both team and client membership types)
    IF TG_TABLE_NAME = 'organization_members' THEN
        INSERT INTO team_members (team_id, user_id, role_id)
        SELECT 
            t.id,
            NEW.user_id,
            v_role_id
        FROM teams t
        WHERE t.organization_id = v_organization_id
        AND NOT EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = t.id 
            AND tm.user_id = NEW.user_id
        )
        ON CONFLICT (team_id, user_id) DO NOTHING;
    END IF;

    -- Handle new team creation
    IF TG_TABLE_NAME = 'teams' THEN
        INSERT INTO team_members (team_id, user_id, role_id)
        SELECT 
            NEW.id,
            om.user_id,
            CASE 
                WHEN r.name = 'admin' THEN r.id
                ELSE (SELECT id FROM roles WHERE name = 'member')
            END
        FROM organization_members om
        JOIN roles r ON r.id = om.role_id
        WHERE om.organization_id = v_organization_id
        -- Include both team and client membership types
        AND NOT EXISTS (
            SELECT 1 FROM team_members tm 
            WHERE tm.team_id = NEW.id 
            AND tm.user_id = om.user_id
        )
        ON CONFLICT (team_id, user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER org_member_created_add_to_teams_for_team_membership_membership_users
    AFTER INSERT ON public.organization_members
    FOR EACH ROW
    EXECUTE FUNCTION add_internal_team_member_to_all_teams();

CREATE OR REPLACE TRIGGER new_team_created_add_members_for_team_membership_membership_users
    AFTER INSERT ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION add_internal_team_member_to_all_teams();

