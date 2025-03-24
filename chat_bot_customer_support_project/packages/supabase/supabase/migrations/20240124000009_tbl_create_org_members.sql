-- Create Organization Members table with CASCADE delete
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    role_id UUID REFERENCES public.roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
    membership_type membership_type NOT NULL,
    UNIQUE(organization_id, user_id)
);

-- Create indexes
CREATE INDEX idx_org_members_org_id 
    ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user_id 
    ON public.organization_members(user_id);
CREATE INDEX idx_org_members_role_id
    ON public.organization_members(role_id);

-- Create trigger for organization_members
CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column(); 