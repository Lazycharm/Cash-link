# Supabase Production Setup Guide

## Problem: Redirects to Localhost After Login/Signup

If users are being redirected to `localhost` after login or signup on your production site, you need to configure Supabase redirect URLs.

## Solution: Configure Supabase Redirect URLs

### Step 1: Access Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**

### Step 2: Add Production Redirect URLs

In the **Redirect URLs** section, add your production URLs:

```
https://cashlink.business/**
https://cashlink.business/complete-signup
https://cashlink.business/
https://cashlink.business/home
```

**Important Notes:**
- The `/**` wildcard allows all paths under your domain
- Add each specific path you want to allow

### Step 3: Add Site URL

In the **Site URL** field, set your production URL:

```
https://cashlink.business
```

### Step 4: Keep Localhost for Development (Optional)

You can keep localhost URLs for local development:

```
http://localhost:3000/**
http://localhost:3000/complete-signup
http://localhost:3000/
```

## Example Configuration

Here's what your Supabase URL Configuration should look like:

**Site URL:**
```
https://cashlink.business
```

**Redirect URLs:**
```
http://localhost:3000/**
https://cashlink.business/**
https://cashlink.business/complete-signup
https://cashlink.business/
https://cashlink.business/home
```

## Verify Configuration

After updating:

1. **Save** the configuration in Supabase
2. **Clear browser cache** or use incognito mode
3. **Test login/signup** on your production site
4. Verify redirect goes to production URL, not localhost

## Common Issues

### Issue 1: Still redirecting to localhost

**Solution:**
- Clear browser cache and cookies
- Check that you saved the configuration in Supabase
- Wait 1-2 minutes for changes to propagate
- Verify the exact URL matches (including `https://` and trailing slashes)

### Issue 2: "Redirect URL not allowed" error

**Solution:**
- Ensure the exact URL is in the Redirect URLs list
- Check for typos in the URL
- Make sure you're using `https://` (not `http://`) for production

### Issue 3: OAuth callback fails

**Solution:**
- Verify Google OAuth is configured in Supabase
- Check that your Google OAuth credentials include the production URL
- Ensure the redirect URL in your code matches Supabase configuration

## Code Verification

Your code should use `window.location.origin` to dynamically get the current domain:

```javascript
// ✅ Correct - Uses current domain
const redirectUrl = `${window.location.origin}/complete-signup`;
await signInWithGoogle(redirectUrl);

// ❌ Wrong - Hardcoded localhost
const redirectUrl = `http://localhost:3000/complete-signup`;
```

## Testing Checklist

- [ ] Added production URL to Supabase Redirect URLs
- [ ] Set Site URL in Supabase
- [ ] Tested login on production
- [ ] Tested signup on production
- [ ] Verified redirect goes to production domain
- [ ] Tested with Google OAuth
- [ ] Tested with email/password login

## Need Help?

If issues persist:
1. Check Supabase logs in the Dashboard
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure Netlify environment variables match your Supabase project
