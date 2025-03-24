-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add updated_at trigger to chats
CREATE TRIGGER set_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tokens_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add updated_at trigger to messages
CREATE TRIGGER set_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for chats and messages tables
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Chats policies
CREATE POLICY "Users can view their team's chats"
    ON public.chats
    FOR SELECT
    USING (
        team_id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create chats in their teams"
    ON public.chats
    FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their team's chats"
    ON public.chats
    FOR UPDATE
    USING (
        team_id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their team's chats"
    ON public.chats
    FOR DELETE
    USING (
        team_id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages in their team's chats"
    ON public.messages
    FOR SELECT
    USING (
        chat_id IN (
            SELECT id 
            FROM public.chats 
            WHERE team_id IN (
                SELECT team_id 
                FROM public.team_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create messages in their team's chats"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        chat_id IN (
            SELECT id 
            FROM public.chats 
            WHERE team_id IN (
                SELECT team_id 
                FROM public.team_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own messages"
    ON public.messages
    FOR UPDATE
    USING (
        created_by = auth.uid()
    );

CREATE POLICY "Users can delete their own messages"
    ON public.messages
    FOR DELETE
    USING (
        created_by = auth.uid()
    );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
