-- Supabase Auth setup for SafeSphere
-- Run this in your Supabase SQL Editor

-- Add user_type column to auth.users metadata
-- This distinguishes between regular users and guardians
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'user';
