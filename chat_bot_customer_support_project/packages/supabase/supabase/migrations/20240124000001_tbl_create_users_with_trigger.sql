-- Create updated users table with Stripe fields
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (
        NEW.id, 
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Update trigger for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users: allow authenticated users to read all user data
DROP POLICY IF EXISTS users_read_policy ON public.users;
CREATE POLICY users_read_policy ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Policy for users: allow users to update their own data
CREATE POLICY users_update_policy ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy for users: allow users to insert/upsert their own data
CREATE POLICY users_insert_policy ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id OR id = auth.uid());

-- Policy for supabase_auth_admin
CREATE POLICY admin_all_policy ON public.users
    FOR ALL
    TO supabase_auth_admin
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON TABLE public.users TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin; 