-- Add tool_calls column to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS tool_calls JSONB DEFAULT NULL;

-- Update the comment for the metadata field to clarify its purpose
COMMENT ON COLUMN public.messages.metadata IS 'Additional metadata about the message';

-- Add a comment for the tool_calls field
COMMENT ON COLUMN public.messages.tool_calls IS 'Tool calls requested by and results returned to the model';

-- Create an index on the tool_calls column to improve query performance
CREATE INDEX IF NOT EXISTS idx_messages_tool_calls ON public.messages USING GIN (tool_calls); 