-- Migration: Fix check constraints for various tables
-- ============================================

-- Fix subscription_requests status to include 'paid'
ALTER TABLE public.subscription_requests 
DROP CONSTRAINT IF EXISTS subscription_requests_status_check;

ALTER TABLE public.subscription_requests 
ADD CONSTRAINT subscription_requests_status_check 
CHECK (status IN ('pending', 'paid', 'approved', 'rejected', 'completed'));

-- Fix promotion_requests status to include 'paid'
ALTER TABLE public.promotion_requests 
DROP CONSTRAINT IF EXISTS promotion_requests_status_check;

ALTER TABLE public.promotion_requests 
ADD CONSTRAINT promotion_requests_status_check 
CHECK (status IN ('pending', 'paid', 'approved', 'rejected', 'completed'));

-- Also ensure profiles kyc_status includes 'not_submitted' for new users
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_kyc_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_kyc_status_check 
CHECK (kyc_status IN ('not_submitted', 'pending', 'approved', 'rejected'));

-- Update existing null kyc_status to 'not_submitted'
UPDATE public.profiles SET kyc_status = 'not_submitted' WHERE kyc_status IS NULL;

-- Fix promotion_requests entity_type to include agent and driver
ALTER TABLE public.promotion_requests 
DROP CONSTRAINT IF EXISTS promotion_requests_entity_type_check;

ALTER TABLE public.promotion_requests 
ADD CONSTRAINT promotion_requests_entity_type_check 
CHECK (entity_type IN ('business', 'job', 'event', 'marketplace_item', 'agent', 'driver'));

-- Add is_promoted column to profiles for agent/driver promotion
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE;

-- Add is_promoted column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE;

-- Add is_promoted column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE;

-- Add is_promoted column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE;

-- Add is_promoted column to marketplace_items table
ALTER TABLE public.marketplace_items 
ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT FALSE;
