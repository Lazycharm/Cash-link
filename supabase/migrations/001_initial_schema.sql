-- CashLink Database Schema Migration
-- This migration creates all tables based on the Base44 entity schemas
-- Run this in Supabase SQL Editor or via supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'agent', 'driver', 'admin')),
  app_role TEXT CHECK (app_role IN ('customer', 'vendor', 'agent', 'driver')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
  kyc_documents JSONB DEFAULT '{}',
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'expired')),
  subscription_expires TIMESTAMPTZ,
  location JSONB,
  profile_image TEXT,
  preferred_language TEXT DEFAULT 'en',
  bio TEXT,
  whatsapp TEXT,
  services_offered JSONB DEFAULT '[]',
  operating_hours JSONB,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- BUSINESSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('restaurant', 'transport', 'grocery', 'services', 'entertainment', 'retail', 'other')),
  images TEXT[] DEFAULT '{}',
  location JSONB,
  contact JSONB,
  hours JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN DEFAULT FALSE,
  promotion_expires TIMESTAMPTZ,
  rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poster_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('hospitality', 'construction', 'transport', 'domestic', 'sales', 'technology', 'healthcare', 'other')),
  salary_range TEXT,
  location JSONB,
  contact JSONB,
  employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'temporary')),
  requirements TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'filled')),
  is_featured BOOLEAN DEFAULT FALSE,
  promotion_expires TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('community', 'cultural', 'business', 'sports', 'entertainment', 'religious', 'other')),
  images TEXT[] DEFAULT '{}',
  location JSONB,
  contact JSONB,
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  is_free BOOLEAN DEFAULT TRUE,
  ticket_price NUMERIC(10,2),
  max_attendees INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  is_featured BOOLEAN DEFAULT FALSE,
  promotion_expires TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  attendees_count INTEGER DEFAULT 0,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MARKETPLACE_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('electronics', 'furniture', 'clothing', 'vehicles', 'home', 'services', 'other')),
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  images TEXT[] DEFAULT '{}',
  location JSONB,
  contact JSONB,
  is_negotiable BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sold')),
  is_featured BOOLEAN DEFAULT FALSE,
  promotion_expires TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('withdrawal', 'deposit', 'payment', 'subscription', 'promotion')),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'rejected')),
  payment_method TEXT CHECK (payment_method IN ('mtn_mobile_money', 'airtel_money', 'mpesa', 'flutterwave', 'cash', 'bank_transfer')),
  reference TEXT,
  notes TEXT,
  location JSONB,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'transaction')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DONATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount NUMERIC(12,2),
  raised_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'AED',
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  expires_at TIMESTAMPTZ,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOST_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.lost_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  images TEXT[] DEFAULT '{}',
  location JSONB,
  contact JSONB,
  date_lost_found DATE,
  reward NUMERIC(10,2),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMERGENCY_SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.emergency_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  phone TEXT,
  description TEXT,
  location JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SITE_CONTENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  content TEXT,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown')),
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROMOTION_REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.promotion_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('business', 'job', 'event', 'marketplace_item')),
  entity_id UUID NOT NULL,
  package_id TEXT,
  package_name TEXT,
  duration_days INTEGER,
  cost NUMERIC(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTION_REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscription_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  package_id TEXT,
  package_name TEXT,
  duration_days INTEGER,
  cost NUMERIC(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACTIVITY_LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APP_SETTINGS TABLE (singleton pattern)
-- ============================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscription_prices JSONB DEFAULT '{"monthly": 30, "quarterly": 80, "yearly": 300}',
  subscriptions_enabled BOOLEAN DEFAULT TRUE,
  promotion_price NUMERIC(10,2) DEFAULT 10,
  promotion_packages JSONB DEFAULT '[]',
  admin_whatsapp TEXT,
  admin_email TEXT,
  features_enabled JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.app_settings (subscription_prices, subscriptions_enabled, promotion_price)
VALUES ('{"monthly": 30, "quarterly": 80, "yearly": 300}', TRUE, 10)
ON CONFLICT DO NOTHING;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);

CREATE INDEX IF NOT EXISTS idx_jobs_poster ON public.jobs(poster_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);

CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);

CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON public.marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON public.marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_items(category);

CREATE INDEX IF NOT EXISTS idx_transactions_customer ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_agent ON public.transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON public.profiles(kyc_status);
