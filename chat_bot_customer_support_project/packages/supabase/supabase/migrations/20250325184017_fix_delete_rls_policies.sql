-- This migration fixes the delete RLS policies for chats and messages tables
-- The current policies are failing in integration tests

-- Drop existing delete policies
DROP POLICY IF EXISTS "Users can delete their team's chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete messages in their team's chats" ON public.messages;

-- Re-create the delete policy for chats with stricter checks
CREATE POLICY "Users can delete their team's chats"
    ON public.chats
    FOR DELETE
    TO authenticated
    USING (
        -- Allow users to delete chats only in teams they are a member of
        EXISTS (
            SELECT 1 
            FROM public.team_members 
            WHERE team_members.team_id = chats.team_id 
            AND team_members.user_id = auth.uid()
        )
    );

-- Re-create the delete policy for messages with stricter checks
CREATE POLICY "Users can delete messages in their team's chats"
    ON public.messages
    FOR DELETE
    TO authenticated
    USING (
        -- Allow users to delete messages only in chats from teams they belong to
        EXISTS (
            SELECT 1 
            FROM public.chats
            JOIN public.team_members ON chats.team_id = team_members.team_id
            WHERE chats.id = messages.chat_id
            AND team_members.user_id = auth.uid()
        )
    );

-- Ensure RLS is enabled on both tables
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Make sure unauthenticated users cannot access the tables at all
-- This ensures proper restriction on all operations including delete
GRANT USAGE ON SCHEMA public TO anon;
REVOKE ALL ON public.chats FROM anon;
REVOKE ALL ON public.messages FROM anon;

-- Grant authenticated users appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
