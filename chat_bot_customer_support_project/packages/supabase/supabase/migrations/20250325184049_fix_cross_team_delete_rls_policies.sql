-- This migration addresses issues with cross-team delete access
-- The test failures indicate that users can delete resources from teams they don't belong to

-- Create a function to validate if a user has access to a specific chat
CREATE OR REPLACE FUNCTION public.current_user_has_chat_access(chat_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.chats c
    JOIN public.team_members tm ON c.team_id = tm.team_id
    WHERE c.id = chat_id
    AND tm.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to validate if a user has access to a specific message
CREATE OR REPLACE FUNCTION public.current_user_has_message_access(message_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.messages m
    JOIN public.chats c ON m.chat_id = c.id
    JOIN public.team_members tm ON c.team_id = tm.team_id
    WHERE m.id = message_id
    AND tm.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing delete policies
DROP POLICY IF EXISTS "Users can delete their team's chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete messages in their team's chats" ON public.messages;

-- Create more restrictive delete policies for chats using the security definer function
CREATE POLICY "Users can delete their team's chats"
    ON public.chats
    FOR DELETE
    TO authenticated
    USING (current_user_has_chat_access(id));

-- Create more restrictive delete policies for messages using the security definer function
CREATE POLICY "Users can delete messages in their team's chats"
    ON public.messages
    FOR DELETE
    TO authenticated
    USING (current_user_has_message_access(id));

-- Additional safety measures: restrict cross-table access via CHECK constraints in RLS
ALTER TABLE public.chats FORCE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;
