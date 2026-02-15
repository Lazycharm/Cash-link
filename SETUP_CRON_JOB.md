# Setup Cron Job for Daily Reminders

Supabase doesn't have a built-in cron job UI. You need to set it up using SQL with the `pg_cron` extension.

## Step-by-Step Instructions

### Step 1: Open SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `qdwfaheqflmqdraknpif`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Enable Required Extensions

Run these SQL commands one by one:

**A. Enable pg_cron extension:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

**B. Enable http extension (for making HTTP requests):**
```sql
CREATE EXTENSION IF NOT EXISTS http;
```

**C. Enable pg_net extension (for net.http_post):**
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Step 3: Get Your Service Role Key

1. In Supabase Dashboard, go to **Settings** → **API**
2. Find the **service_role** key (NOT the anon key)
3. Copy it - you'll need it in the next step

⚠️ **Important:** Keep this key secret! It has full database access.

### Step 4: Schedule the Daily Reminder Job

Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key:

```sql
SELECT cron.schedule(
  'daily-reminders',                    -- Job name (unique identifier)
  '0 9 * * *',                         -- Schedule: Daily at 9:00 AM UTC
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

**Example with actual key (replace with yours):**
```sql
SELECT cron.schedule(
  'daily-reminders',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qdwfaheqflmqdraknpif.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd2ZhaGVxZmxtcWRyYWtucGlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODgxMjIwNywiZXhwIjoyMDg0Mzg4MjA3fQ.Jvx5yU3NKqn1lhMfNI5n7MhvO23QZO2pELEFB5eoUqk'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

### Step 5: Verify the Cron Job

Check that the job was created:

```sql
SELECT * FROM cron.job WHERE jobname = 'daily-reminders';
```

You should see a row with:
- `jobname`: `daily-reminders`
- `schedule`: `0 9 * * *`
- `active`: `true`

### Step 6: Test the Cron Job (Optional)

Run the job immediately to test:

```sql
SELECT cron.job_run(jobid) 
FROM cron.job 
WHERE jobname = 'daily-reminders';
```

### Step 7: View Cron Job Logs

Check execution history:

```sql
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-reminders')
ORDER BY start_time DESC 
LIMIT 10;
```

## Schedule Format

The schedule uses standard cron format: `minute hour day month weekday`

Examples:
- `0 9 * * *` - Daily at 9:00 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1` - Every Monday at 9:00 AM UTC
- `*/30 * * * *` - Every 30 minutes

## Troubleshooting

### Error: "extension pg_cron does not exist"
- Make sure you're running the `CREATE EXTENSION` commands
- Some Supabase plans may not support pg_cron - check your plan

### Error: "extension pg_net does not exist"
- Try using `http` extension instead:
```sql
CREATE EXTENSION IF NOT EXISTS http;
```
- Then use `http_post` instead of `net.http_post`

### Error: "permission denied"
- Make sure you're using the service role key (not anon key)
- Verify you're the project owner

### Cron job not running
1. Check if the job is active:
   ```sql
   SELECT active FROM cron.job WHERE jobname = 'daily-reminders';
   ```
2. Check the logs for errors:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-reminders')
   ORDER BY start_time DESC LIMIT 5;
   ```
3. Verify the edge function URL is correct
4. Test the edge function manually first

## Update or Delete Cron Job

**Unschedule (disable) the job:**
```sql
SELECT cron.unschedule('daily-reminders');
```

**Delete the job completely:**
```sql
SELECT cron.unschedule(jobid) 
FROM cron.job 
WHERE jobname = 'daily-reminders';
```

**Update the schedule:**
```sql
-- First unschedule
SELECT cron.unschedule('daily-reminders');

-- Then create new schedule
SELECT cron.schedule(
  'daily-reminders',
  '0 10 * * *',  -- New time: 10 AM instead of 9 AM
  $$ ... $$      -- Same command as before
);
```

## Alternative: Using http Extension

If `pg_net` doesn't work, use the `http` extension:

```sql
SELECT cron.schedule(
  'daily-reminders',
  '0 9 * * *',
  $$
  SELECT http_post(
    'https://qdwfaheqflmqdraknpif.supabase.co/functions/v1/send-reminders',
    '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    '{}'::jsonb
  );
  $$
);
```
