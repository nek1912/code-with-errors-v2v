-- Run this in the Supabase SQL Editor to update the journeys table schema
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS destination_name TEXT;
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS destination_lat FLOAT8;
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS destination_lng FLOAT8;
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS transport_mode TEXT DEFAULT 'walking';
