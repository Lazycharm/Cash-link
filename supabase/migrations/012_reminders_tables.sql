-- Reminders Tables Migration
-- Creates tables for Visa Expiry Reminders and Bill Reminders

-- ============================================
-- VISA EXPIRY REMINDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.visa_expiry_reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('visa', 'passport', 'emirates_id')),
  document_number TEXT,
  expiry_date DATE NOT NULL,
  reminder_days_before INTEGER[] DEFAULT ARRAY[30, 14, 7, 1], -- Days before expiry to send reminders
  is_active BOOLEAN DEFAULT TRUE,
  last_reminder_sent TIMESTAMPTZ,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BILL REMINDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bill_reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  bill_type TEXT NOT NULL CHECK (bill_type IN ('dewa', 'etisalat', 'du', 'other')),
  bill_name TEXT NOT NULL,
  account_number TEXT,
  due_date DATE NOT NULL,
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'AED',
  reminder_days_before INTEGER[] DEFAULT ARRAY[7, 3, 1], -- Days before due date to send reminders
  is_active BOOLEAN DEFAULT TRUE,
  is_paid BOOLEAN DEFAULT FALSE,
  last_reminder_sent TIMESTAMPTZ,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_visa_reminders_user ON public.visa_expiry_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_visa_reminders_expiry ON public.visa_expiry_reminders(expiry_date);
CREATE INDEX IF NOT EXISTS idx_visa_reminders_active ON public.visa_expiry_reminders(is_active);

CREATE INDEX IF NOT EXISTS idx_bill_reminders_user ON public.bill_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_reminders_due_date ON public.bill_reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_bill_reminders_active ON public.bill_reminders(is_active);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
ALTER TABLE public.visa_expiry_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_reminders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own reminders
CREATE POLICY "Users can view their own visa reminders"
  ON public.visa_expiry_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visa reminders"
  ON public.visa_expiry_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visa reminders"
  ON public.visa_expiry_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visa reminders"
  ON public.visa_expiry_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Bill reminders policies
CREATE POLICY "Users can view their own bill reminders"
  ON public.bill_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bill reminders"
  ON public.bill_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bill reminders"
  ON public.bill_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bill reminders"
  ON public.bill_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATE TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to both tables
DROP TRIGGER IF EXISTS update_visa_reminders_updated_at ON public.visa_expiry_reminders;
CREATE TRIGGER update_visa_reminders_updated_at
  BEFORE UPDATE ON public.visa_expiry_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bill_reminders_updated_at ON public.bill_reminders;
CREATE TRIGGER update_bill_reminders_updated_at
  BEFORE UPDATE ON public.bill_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
