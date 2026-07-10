CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the foreign key constraint that links public.users to auth.users
-- This allows us to use our custom JWT auth without relying on Supabase Auth
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- If the users table does not exist, create it.
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY
);

-- Safely add the columns required for Custom Auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create the index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
