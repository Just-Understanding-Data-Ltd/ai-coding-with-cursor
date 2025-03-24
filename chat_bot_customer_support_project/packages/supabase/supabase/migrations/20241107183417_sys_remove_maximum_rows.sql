-- Remove row limit for PostgREST
ALTER ROLE postgres SET pgrst.db_max_rows = -1;

-- Also set it for the current session
SET pgrst.db_max_rows = -1;