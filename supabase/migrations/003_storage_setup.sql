-- CashLink Storage Configuration
-- Run this in Supabase SQL Editor to set up file storage

-- Create storage bucket for all CashLink files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cashlink-files',
  'cashlink-files',
  true,
  5242880, -- 5MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for cashlink-files bucket

-- Drop existing policies first to recreate them
DROP POLICY IF EXISTS "Public files are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all files" ON storage.objects;

-- Anyone can view public files
CREATE POLICY "Public files are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cashlink-files');

-- Authenticated users can upload files (simplified - bucket is public)
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cashlink-files' AND
    auth.role() = 'authenticated'
  );

-- Authenticated users can update files
CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'cashlink-files' AND
    auth.role() = 'authenticated'
  );

-- Authenticated users can delete files  
CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cashlink-files' AND
    auth.role() = 'authenticated'
  );

-- Admins can manage all files
CREATE POLICY "Admins can manage all files"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'cashlink-files' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
