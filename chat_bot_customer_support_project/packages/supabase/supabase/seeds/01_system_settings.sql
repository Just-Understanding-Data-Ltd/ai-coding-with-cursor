/*
01_system_settings.sql
Adds the ability for the database to know what environment it is operating in 
by adding a custom environment key within the system_settings table.
*/
INSERT INTO system_settings(key, value) VALUES
  ('supabase_environment', '{"environment": "development"}'::JSONB)
ON CONFLICT (key) DO NOTHING; 