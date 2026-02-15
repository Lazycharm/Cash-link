-- Migration: Add missing columns to app_settings
-- ============================================

-- Add promotion_enabled column
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS promotion_enabled BOOLEAN DEFAULT TRUE;

-- Add maintenance_mode column
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT FALSE;

-- Add app_version column
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS app_version TEXT DEFAULT '1.0.0';

-- Add admin_email column (if not exists)
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS admin_email TEXT;

-- Make sure RLS allows admins to INSERT as well
DROP POLICY IF EXISTS "Admins can insert app_settings" ON public.app_settings;
CREATE POLICY "Admins can insert app_settings"
  ON public.app_settings FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
