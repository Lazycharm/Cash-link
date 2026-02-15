-- Add location tracking fields to profiles table
-- This migration adds latitude, longitude, is_online, and last_seen fields
-- for agents and drivers to enable nearby map discovery

-- Add latitude column (nullable, for agents and drivers)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;

-- Add longitude column (nullable, for agents and drivers)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add is_online column (default false, indicates if agent/driver is currently online)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- Add last_seen timestamp (tracks when location was last updated)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

-- Create index for efficient nearby queries (using PostGIS-like distance calculation)
-- This index helps with queries that filter by is_online and role
CREATE INDEX IF NOT EXISTS idx_profiles_location_online ON profiles(is_online, role) WHERE is_online = TRUE AND role IN ('agent', 'driver');

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_location_coords ON profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comment to explain the fields
COMMENT ON COLUMN profiles.latitude IS 'Current latitude for location-based services (agents/drivers)';
COMMENT ON COLUMN profiles.longitude IS 'Current longitude for location-based services (agents/drivers)';
COMMENT ON COLUMN profiles.is_online IS 'Whether the agent/driver is currently online and accepting requests';
COMMENT ON COLUMN profiles.last_seen IS 'Timestamp of last location update';
