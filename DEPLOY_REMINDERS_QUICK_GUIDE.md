# Quick Guide: Deploy Reminders Function

## Prerequisites Checklist

- [ ] Supabase account created
- [ ] Project created in Supabase Dashboard
- [ ] Project Reference ID copied
- [ ] PowerShell (Windows) or Terminal (macOS/Linux)

## Step-by-Step Deployment

### 1. Install Supabase CLI (Windows)

**Choose ONE method:**

**Method A: Using Scoop (Recommended)**
```powershell
# Install Scoop first (if not installed)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Method B: Using winget**
```powershell
winget install --id=Supabase.CLI
```

**Method C: Direct Download**
1. Go to: https://github.com/supabase/cli/releases/latest
2. Download: `supabase_windows_amd64.zip`
3. Extract and add `supabase.exe` to your PATH

**Verify Installation:**
```powershell
supabase --version
```

### 2. Login
```bash
supabase login
```
*Opens browser for authentication*

### 3. Link Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
*Replace `YOUR_PROJECT_REF` with your actual project reference ID*

**Where to find Project Ref:**
- Supabase Dashboard → Your Project → Settings → General → Reference ID

### 4. Navigate to Project Root
```bash
cd C:\CashLink
```
*Or wherever your CashLink project is located*

### 5. Deploy Function
```bash
supabase functions deploy send-reminders
```

### 6. Verify Success
You should see:
```
Deployed function send-reminders (https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders)
```

## Quick Test

After deployment, test the function:

```bash
# Replace with your actual values
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders ^
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" ^
  -H "Content-Type: application/json" ^
  -d "{}"
```

**Get Service Role Key:**
- Supabase Dashboard → Settings → API → `service_role` key (keep this secret!)

## Common Issues

| Issue | Solution |
|-------|----------|
| "Not logged in" | Run `supabase login` |
| "Project not linked" | Run `supabase link --project-ref YOUR_REF` |
| "Function not found" | Check file exists: `supabase/functions/send-reminders/index.ts` |
| Permission error | Verify you're project owner in Supabase Dashboard |

## Next Step

After successful deployment, set up the cron job (see REMINDERS_SETUP.md section 2).
