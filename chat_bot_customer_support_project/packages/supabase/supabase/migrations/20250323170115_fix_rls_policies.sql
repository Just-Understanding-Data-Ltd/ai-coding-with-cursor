-- Drop existing policies for chats and messages to recreate them
DROP POLICY IF EXISTS "Users can view their team's chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats in their teams" ON public.chats;
DROP POLICY IF EXISTS "Users can update their team's chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete their team's chats" ON public.chats;

DROP POLICY IF EXISTS "Users can view messages in their team's chats" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their team's chats" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Create more permissive policies for chats
CREATE POLICY "Users can view their team's chats"
    ON public.chats
    FOR SELECT
    USING (
        -- Allow users to see chats in teams they are a member of
        EXISTS (
            SELECT 1 
            FROM public.team_members 
            WHERE team_members.team_id = chats.team_id 
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create chats in their teams"
    ON public.chats
    FOR INSERT
    WITH CHECK (
        -- Allow users to create chats in teams they are a member of
        EXISTS (
            SELECT 1 
            FROM public.team_members 
            WHERE team_members.team_id = chats.team_id 
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their team's chats"
    ON public.chats
    FOR UPDATE
    USING (
        -- Allow users to update chats in teams they are a member of
        EXISTS (
            SELECT 1 
            FROM public.team_members 
            WHERE team_members.team_id = chats.team_id 
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their team's chats"
    ON public.chats
    FOR DELETE
    USING (
        -- Allow users to delete chats in teams they are a member of
        EXISTS (
            SELECT 1 
            FROM public.team_members 
            WHERE team_members.team_id = chats.team_id 
            AND team_members.user_id = auth.uid()
        )
    );

-- Create more permissive policies for messages
CREATE POLICY "Users can view messages in their team's chats"
    ON public.messages
    FOR SELECT
    USING (
        -- Allow users to see messages in chats from teams they belong to
        EXISTS (
            SELECT 1 
            FROM public.chats
            JOIN public.team_members ON chats.team_id = team_members.team_id
            WHERE chats.id = messages.chat_id
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their team's chats"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        -- Allow users to create messages in chats from teams they belong to
        EXISTS (
            SELECT 1 
            FROM public.chats
            JOIN public.team_members ON chats.team_id = team_members.team_id
            WHERE chats.id = messages.chat_id
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their team's chats"
    ON public.messages
    FOR UPDATE
    USING (
        -- Allow users to update any messages in chats from teams they belong to
        EXISTS (
            SELECT 1 
            FROM public.chats
            JOIN public.team_members ON chats.team_id = team_members.team_id
            WHERE chats.id = messages.chat_id
            AND team_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages in their team's chats"
    ON public.messages
    FOR DELETE
    USING (
        -- Allow users to delete any messages in chats from teams they belong to
        EXISTS (
            SELECT 1 
            FROM public.chats
            JOIN public.team_members ON chats.team_id = team_members.team_id
            WHERE chats.id = messages.chat_id
            AND team_members.user_id = auth.uid()
        )
    );

-- Make owner of the record be set automatically for chats and messages
ALTER TABLE public.chats ALTER COLUMN created_by SET DEFAULT auth.uid();
ALTER TABLE public.messages ALTER COLUMN created_by SET DEFAULT auth.uid(); 