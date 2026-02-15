-- Migration: Add career_build_url to app_settings
-- ============================================

ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS career_build_url TEXT DEFAULT 'https://carreerbuild.com';
