-- Create membership type enumeration
CREATE TYPE membership_type AS ENUM ('team', 'client'); 

-- Enable pgcrypto extension for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;