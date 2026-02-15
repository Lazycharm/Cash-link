# Reminders System Setup Guide

This guide explains how to set up and use the Visa Expiry Reminders and Bill Reminders features.

## Database Setup

1. **Run the migration:**
   ```sql
   -- Run the migration file in Supabase SQL Editor
   -- File: supabase/migrations/012_reminders_tables.sql
   ```

   This creates two tables:
   - `visa_expiry_reminders` - For visa, passport, and Emirates ID expiry reminders
   - `bill_reminders` - For utility bill payment reminders

## Edge Function Setup

### Step 1: Install Supabase CLI

**⚠️ IMPORTANT:** Supabase CLI cannot be installed via `npm install -g`. Use one of the methods below.

**For Windows (Recommended Options):**

**Option A: Using Scoop (Easiest for Windows)**
```powershell
# First, install Scoop if you don't have it
# Run in PowerShell (as Administrator):
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Then install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Option B: Using winget (Windows Package Manager)**
```powershell
winget install --id=Supabase.CLI
```

**Option C: Using Chocolatey**
```powershell
# If you have Chocolatey installed
choco install supabase
```

**Option D: Direct Download (Manual)**
1. Visit: https://github.com/supabase/cli/releases/latest
2. Download: `supabase_windows_amd64.zip` (or `supabase_windows_arm64.zip` for ARM)
3. Extract the ZIP file
4. Copy `supabase.exe` to a folder in your PATH (e.g., `C:\Windows\System32` or create `C:\Tools\supabase` and add it to PATH)
5. Verify installation:
   ```powershell
   supabase --version
   ```

**For macOS:**
```bash
brew install supabase/tap/supabase
```

**For Linux:**
```bash
# Using Homebrew
brew install supabase/tap/supabase

# Or download binary directly
# Visit: https://github.com/supabase/cli/releases/latest
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will:
1. Open your browser to authenticate
2. Ask you to authorize the CLI
3. Save your credentials locally

### Step 3: Link Your Project

You need to link your local project to your Supabase project:

```bash
supabase link --project-ref qdwfaheqflmqdraknpif
```

**How to find your Project Ref:**
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID" (it looks like: `abcdefghijklmnop`)

**Example:**
```bash
supabase link --project-ref abcdefghijklmnop
```

**Alternative: If you're already in the project directory and have a `.env` file:**
```bash
# The CLI will prompt you to select from your projects
supabase link
```

### Step 4: Verify Function Exists

Make sure the function file exists at:
```
supabase/functions/send-reminders/index.ts
```

You can verify by checking:
```bash
# Windows PowerShell
dir supabase\functions\send-reminders

# macOS/Linux/Git Bash
ls supabase/functions/send-reminders
```

### Step 5: Deploy the Function

Deploy the `send-reminders` function:

```bash
supabase functions deploy send-reminders
```

**What happens during deployment:**
1. CLI uploads the function code to Supabase
2. Supabase builds and deploys the Deno function
3. You'll see progress output in your terminal
4. On success, you'll see: `Deployed function send-reminders`

**Expected Output:**
```
Deploying send-reminders...
Deployed function send-reminders (https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders)
```

### Step 6: Verify Deployment

**Option A: Check in Supabase Dashboard**
1. Go to: https://app.supabase.com
2. Select your project
3. Navigate to: **Edge Functions** (in left sidebar)
4. You should see `send-reminders` in the list

**Option B: Test the Function**

**For PowerShell (Windows):**
```powershell
# Get your project URL and service role key from Supabase Dashboard
# Settings → API → Project URL and service_role key

$headers = @{
    "Authorization" = "Bearer YOUR_SERVICE_ROLE_KEY"
    "Content-Type" = "application/json"
}

$body = @{} | ConvertTo-Json

Invoke-RestMethod -Uri "https://qdwfaheqflmqdraknpif.supabase.co/functions/v1/send-reminders" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

**For Bash/Linux/macOS:**
```bash
curl -X POST https://qdwfaheqflmqdraknpif.supabase.co/functions/v1/send-reminders \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Quick Test (PowerShell - One Line):**
```powershell
Invoke-RestMethod -Uri "https://qdwfaheqflmqdraknpif.supabase.co/functions/v1/send-reminders" -Method Post -Headers @{"Authorization"="Bearer YOUR_SERVICE_ROLE_KEY"; "Content-Type"="application/json"} -Body '{}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "No reminders to send",
  "visa_reminders": 0,
  "bill_reminders": 0,
  "total": 0
}
```

### Troubleshooting Deployment

**Error: "Not logged in"**
```bash
# Re-login
supabase login
```

**Error: "Project not linked"**
```bash
# Re-link your project
supabase link --project-ref YOUR_PROJECT_REF
```

**Error: "Function not found"**
- Verify the file exists: `supabase/functions/send-reminders/index.ts`
- Check you're in the project root directory
- Ensure the function name matches exactly: `send-reminders`

**Error: "Permission denied"**
- Make sure you're the project owner or have deployment permissions
- Check your Supabase account has access to the project

**Error: "Deno module not found"**
- The function uses Deno standard library
- Make sure your `index.ts` imports are correct
- Supabase handles Deno dependencies automatically

2. **Set up a cron job to run daily:**

   ⚠️ **Note:** Supabase doesn't have a built-in cron job UI. You must set it up using SQL.

   **Quick Setup (see `SETUP_CRON_JOB.md` for detailed instructions):**

   1. Go to **SQL Editor** in Supabase Dashboard
   2. Enable extensions:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   CREATE EXTENSION IF NOT EXISTS pg_net;
   ```

   3. Schedule the job (replace `YOUR_SERVICE_ROLE_KEY`):
   ```sql
   SELECT cron.schedule(
     'daily-reminders',
     '0 9 * * *',  -- Daily at 9 AM UTC
     $$
     SELECT net.http_post(
       url := 'https://qdwfaheqflmqdraknpif.supabase.co/functions/v1/send-reminders',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
       ),
       body := '{}'::jsonb
     );
     $$
   );
   ```

   **For complete step-by-step instructions, see: `SETUP_CRON_JOB.md`**

## How It Works

### Visa Expiry Reminders

- Users can add reminders for:
  - Visa expiration
  - Passport expiration
  - Emirates ID expiration

- Default reminder schedule: 30 days, 14 days, 7 days, and 1 day before expiry
- Users receive in-app notifications when reminders are triggered
- Status badges show:
  - **Active** (green) - More than 30 days remaining
  - **Soon** (amber) - 7-30 days remaining
  - **Urgent** (red) - Less than 7 days remaining
  - **Expired** (red) - Past expiry date

### Bill Reminders

- Users can add reminders for:
  - DEWA bills
  - Etisalat bills
  - Du bills
  - Other bills

- Default reminder schedule: 7 days, 3 days, and 1 day before due date
- Users can mark bills as paid
- Status badges show:
  - **Upcoming** (blue) - More than 7 days remaining
  - **Due Soon** (amber) - 3-7 days remaining
  - **Urgent** (red) - 1-3 days remaining
  - **Overdue** (red) - Past due date
  - **Paid** (green) - Bill has been paid

## Features

### User Features

1. **Add Reminders:**
   - Click "Add Reminder" button
   - Fill in the required information
   - Set expiry/due date
   - Add optional notes
   - Toggle active/inactive status

2. **Manage Reminders:**
   - Edit existing reminders
   - Delete reminders
   - Toggle active/inactive status
   - Mark bills as paid

3. **View Reminders:**
   - See all reminders in organized cards
   - View days remaining until expiry/due date
   - See status badges for quick reference

### Notification System

- Reminders are checked daily by the cron job
- When a reminder date matches the configured days before expiry/due date, a notification is sent
- Notifications appear in the user's notification center
- Users receive different notification types:
  - **Info** - Regular reminders (more than 7 days)
  - **Warning** - Urgent reminders (7 days or less)

## Testing

To test the reminder system manually:

1. **Test via Edge Function:**
   ```bash
   curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json"
   ```

2. **Create a test reminder:**
   - Add a visa reminder with expiry date 1 day from today
   - Run the edge function manually
   - Check notifications in the app

## Troubleshooting

### Reminders not sending

1. Check that the cron job is set up correctly
2. Verify the edge function is deployed
3. Check Supabase function logs for errors
4. Ensure reminders are marked as `is_active: true`

### Notifications not appearing

1. Check that notifications table exists
2. Verify user_id matches in reminders and notifications
3. Check browser console for errors
4. Ensure user is logged in

## Security

- Row Level Security (RLS) is enabled on both reminder tables
- Users can only see and manage their own reminders
- Service role key is required for the edge function (keep it secure)

## Future Enhancements

Potential improvements:
- Email notifications in addition to in-app notifications
- WhatsApp notifications via admin WhatsApp number
- Recurring bill reminders (monthly, quarterly)
- Custom reminder schedules per reminder
- Export reminders to calendar
- Bulk operations (mark multiple as paid, etc.)
