--  1. users schema:
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar TEXT,
    stripe_customer_id TEXT,
    stripe_price_id TEXT,
    is_subscribed BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, stripe_customer_id, stripe_price_id, is_subscribed)
    VALUES (
        NEW.id, 
        NEW.email, 
        NULL, -- Assuming stripe_customer_id can be NULL initially
        NULL, -- Assuming stripe_price_id can be NULL initially
        FALSE -- Assuming is_subscribed defaults to FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 2. Stripe Accounts Table
CREATE TABLE public.stripe_accounts (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_account_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Private Links Table
CREATE TABLE public.private_links (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    link TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Subscription and Transaction History Table
CREATE TABLE public.transactions (
    id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_id TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT, -- e.g., 'subscription', 'one-time'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

GRANT INSERT ON TABLE public.users TO supabase_auth_admin;

-- Update the accounts table to include an encrypted stripe_api_key column
ALTER TABLE public.stripe_accounts
ADD COLUMN encrypted_stripe_api_key TEXT;

-- Create a function to encrypt the stripe_api_key
CREATE OR REPLACE FUNCTION public.encrypt_stripe_api_key(api_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(api_key::bytea, 'aes_key'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create a function to decrypt the stripe_api_key
CREATE OR REPLACE FUNCTION public.decrypt_stripe_api_key(encrypted_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN decode(decrypt(encrypted_key::bytea, 'aes_key'), 'hex');
END;
$$ LANGUAGE plpgsql;