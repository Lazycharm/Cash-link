-- Migration: Add Account Deletion section to Privacy Policy
-- This adds the Account Deletion section required for Google Play Data Safety compliance

-- Add Account Deletion section to privacy policy
-- If privacy-policy doesn't exist, create it. If it exists, append the section.

DO $$
DECLARE
  existing_content TEXT;
  account_deletion_section TEXT;
BEGIN
  -- Account Deletion section HTML
  account_deletion_section := E'\n\n<h2>Account Deletion</h2>\n<p>Users can request account deletion by:</p>\n<ol>\n<li>Logging into their account</li>\n<li>Going to Profile → Settings → Delete Account</li>\n</ol>\n<p>OR</p>\n<p>Contacting us at: <a href="mailto:support@cashlink.business">support@cashlink.business</a></p>\n\n<p>Upon deletion, we will remove:</p>\n<ul>\n<li>Profile information</li>\n<li>User-generated content (posts, listings)</li>\n<li>Personal data</li>\n</ul>\n\n<p>We retain transaction records for legal compliance as required by UAE regulations.</p>';

  -- Check if privacy-policy exists
  SELECT content INTO existing_content
  FROM public.site_content
  WHERE key = 'privacy-policy';

  IF existing_content IS NULL THEN
    -- Create privacy-policy if it doesn't exist
    INSERT INTO public.site_content (key, content, content_type, updated_at)
    VALUES (
      'privacy-policy',
      '<h1>Privacy Policy</h1>' || account_deletion_section,
      'html',
      NOW()
    );
  ELSE
    -- Append Account Deletion section if it doesn't already exist
    IF existing_content NOT LIKE '%Account Deletion%' THEN
      UPDATE public.site_content
      SET 
        content = existing_content || account_deletion_section,
        updated_at = NOW()
      WHERE key = 'privacy-policy';
    END IF;
  END IF;
END $$;

-- Verify the update
SELECT key, 
       CASE 
         WHEN content LIKE '%Account Deletion%' THEN 'Account Deletion section added'
         ELSE 'Account Deletion section not found'
       END as status,
       LENGTH(content) as content_length
FROM public.site_content
WHERE key = 'privacy-policy';
