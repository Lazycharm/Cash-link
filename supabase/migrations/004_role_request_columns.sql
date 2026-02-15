-- Migration: Add role request tracking columns
-- ============================================

-- Add requested_role column to track what role user wants
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS requested_role TEXT CHECK (requested_role IN ('vendor', 'agent', 'driver'));

-- Add role_request_status column to track approval status
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role_request_status TEXT DEFAULT 'none' CHECK (role_request_status IN ('none', 'pending', 'approved', 'rejected'));

-- Add kyc_submitted_at to track when KYC was submitted
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_role_request_status ON public.profiles(role_request_status);
CREATE INDEX IF NOT EXISTS idx_profiles_requested_role ON public.profiles(requested_role);

-- Comment for clarity
COMMENT ON COLUMN public.profiles.requested_role IS 'The professional role user has requested (vendor/agent/driver)';
COMMENT ON COLUMN public.profiles.role_request_status IS 'Status of role request: none (no request), pending, approved, rejected';
