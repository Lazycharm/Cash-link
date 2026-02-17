-- Migration: Add donation_contributions table to track individual donations
-- This allows tracking who donated what amount to which campaign

-- ============================================
-- DONATION_CONTRIBUTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.donation_contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'card', 'other')),
  donor_name TEXT, -- For anonymous donations
  donor_email TEXT, -- Optional contact info
  donor_phone TEXT, -- Optional contact info
  message TEXT, -- Optional message from donor
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  reference TEXT, -- Payment reference number
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_donation_contributions_donation_id ON public.donation_contributions(donation_id);
CREATE INDEX IF NOT EXISTS idx_donation_contributions_donor_id ON public.donation_contributions(donor_id);
CREATE INDEX IF NOT EXISTS idx_donation_contributions_status ON public.donation_contributions(status);

-- Add status column to donations table if it doesn't exist (for admin approval)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donations' AND column_name = 'admin_status'
  ) THEN
    ALTER TABLE public.donations ADD COLUMN admin_status TEXT DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- Add is_featured column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donations' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE public.donations ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- RLS Policies for donation_contributions
ALTER TABLE public.donation_contributions ENABLE ROW LEVEL SECURITY;

-- Anyone can view completed contributions (for transparency)
CREATE POLICY "Anyone can view completed contributions"
  ON public.donation_contributions FOR SELECT
  USING (status = 'completed');

-- Donors can view their own contributions
CREATE POLICY "Donors can view own contributions"
  ON public.donation_contributions FOR SELECT
  USING (auth.uid() = donor_id);

-- Authenticated users can create contributions
CREATE POLICY "Authenticated users can create contributions"
  ON public.donation_contributions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Donors can update their own pending contributions
CREATE POLICY "Donors can update own contributions"
  ON public.donation_contributions FOR UPDATE
  USING (auth.uid() = donor_id AND status = 'pending');

-- Admins can view and manage all contributions
CREATE POLICY "Admins can manage all contributions"
  ON public.donation_contributions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to update raised_amount when contribution is completed
CREATE OR REPLACE FUNCTION update_donation_raised_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.donations
    SET raised_amount = COALESCE(raised_amount, 0) + NEW.amount
    WHERE id = NEW.donation_id;
  ELSIF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    -- If contribution is cancelled/refunded, subtract the amount
    UPDATE public.donations
    SET raised_amount = GREATEST(COALESCE(raised_amount, 0) - OLD.amount, 0)
    WHERE id = OLD.donation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update raised_amount
DROP TRIGGER IF EXISTS trigger_update_donation_raised_amount ON public.donation_contributions;
CREATE TRIGGER trigger_update_donation_raised_amount
  AFTER INSERT OR UPDATE OF status ON public.donation_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_donation_raised_amount();
