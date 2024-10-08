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
DECLARE
    encryption_key BYTEA = '\x5E884898DA28047151D0E56F8DC6292773603D0D6AABBDD62A11EF721D1542D8';
    iv BYTEA = '\x000102030405060708090A0B0C0D0E0F';
BEGIN
    RETURN encode(encrypt_iv(api_key::bytea, encryption_key, iv, 'aes-cbc'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to decrypt the stripe_api_key
CREATE OR REPLACE FUNCTION public.decrypt_stripe_api_key(encrypted_key TEXT)
RETURNS TEXT AS $$
DECLARE
    encryption_key BYTEA = '\x5E884898DA28047151D0E56F8DC6292773603D0D6AABBDD62A11EF721D1542D8';
    iv BYTEA = '\x000102030405060708090A0B0C0D0E0F';
BEGIN
    RETURN convert_from(decrypt_iv(decode(encrypted_key, 'base64'), encryption_key, iv, 'aes-cbc'), 'UTF8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE stripe_accounts
ADD CONSTRAINT unique_user_stripe_account UNIQUE (user_id, stripe_account_id);

ALTER TABLE public.private_links
DROP COLUMN user_id;

ALTER TABLE public.private_links
ADD COLUMN email TEXT NOT NULL DEFAULT ''::TEXT;

ALTER TABLE public.private_links
ADD COLUMN user_id UUID NULL,
ADD CONSTRAINT private_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;