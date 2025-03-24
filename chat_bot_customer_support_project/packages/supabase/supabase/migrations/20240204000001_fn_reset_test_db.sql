CREATE OR REPLACE FUNCTION reset_test_db()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tables_to_truncate text;
BEGIN
    -- Temporarily disable all triggers
    SET session_replication_role = 'replica';

    /*
      Build a comma-separated list of all tables in the public schema:
      e.g. public.table1, public.table2, ...
    */
    SELECT string_agg(quote_ident(schemaname) || '.' || quote_ident(tablename), ', ')
      INTO tables_to_truncate
      FROM pg_tables
     WHERE schemaname = 'public';

    -- If at least one table was found in the public schema,
    -- append auth.users and auth.identities, and truncate in one go.
    IF tables_to_truncate IS NOT NULL THEN
        tables_to_truncate := tables_to_truncate || ', auth.users, auth.identities';
        
        EXECUTE format('TRUNCATE %s RESTART IDENTITY CASCADE', tables_to_truncate);
    END IF;

    -- Re-enable all triggers
    SET session_replication_role = 'origin';
END;
$$;

GRANT EXECUTE ON FUNCTION reset_test_db() TO service_role;

COMMENT ON FUNCTION reset_test_db
IS 'Truncates all public schema tables plus auth.users and auth.identities (with RESTART IDENTITY CASCADE) for a clean test DB reset.';
