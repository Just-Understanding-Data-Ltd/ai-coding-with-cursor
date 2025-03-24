-- Create Team Members table with CASCADE delete from team
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    role_id UUID REFERENCES public.roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
    UNIQUE(team_id, user_id)
);

-- Create indexes
CREATE INDEX idx_team_members_team_id 
    ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id 
    ON public.team_members(user_id);
CREATE INDEX idx_team_members_role_id
    ON public.team_members(role_id);

-- Create trigger for team_members
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 