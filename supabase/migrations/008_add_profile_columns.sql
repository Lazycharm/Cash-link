-- Add missing columns to profiles table
-- Run this in Supabase SQL Editor

-- Add avatar_url if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add banner_image if it doesn't exist  
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_image TEXT;

-- Add business_name if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Add business_description if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_description TEXT;

-- Add rating if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 5.0;

-- Add reviews_count if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('avatar_url', 'banner_image', 'business_name', 'business_description', 'rating', 'reviews_count');
