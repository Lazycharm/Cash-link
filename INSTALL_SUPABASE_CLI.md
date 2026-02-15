# Install Supabase CLI on Windows

## Quick Install (Scoop - Recommended)

### Step 1: Install Scoop (if not already installed)

Open PowerShell **as Administrator** and run:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Step 2: Install Supabase CLI

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 3: Verify Installation

```powershell
supabase --version
```

You should see something like: `supabase version 1.x.x`

---

## Alternative: Using winget

If you have Windows 10/11 with winget:

```powershell
winget install --id=Supabase.CLI
```

---

## Alternative: Manual Download

1. **Download the binary:**
   - Go to: https://github.com/supabase/cli/releases/latest
   - Download: `supabase_windows_amd64.zip`

2. **Extract and install:**
   - Extract the ZIP file
   - Copy `supabase.exe` to a folder (e.g., `C:\Tools\supabase\`)

3. **Add to PATH:**
   - Press `Win + X` → System → Advanced system settings
   - Click "Environment Variables"
   - Under "User variables", select "Path" → Edit
   - Click "New" → Add: `C:\Tools\supabase` (or your chosen folder)
   - Click OK on all dialogs

4. **Verify:**
   - Close and reopen PowerShell
   - Run: `supabase --version`

---

## After Installation

Once installed, continue with:

1. **Login:**
   ```powershell
   supabase login
   ```

2. **Link your project:**
   ```powershell
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Deploy the function:**
   ```powershell
   supabase functions deploy send-reminders
   ```

---

## Troubleshooting

**"scoop: command not found"**
- Install Scoop first (Step 1 above)
- Make sure PowerShell is run as Administrator

**"winget: command not found"**
- Use Scoop method instead
- Or download manually

**"supabase: command not found" after manual install**
- Restart PowerShell/Terminal
- Verify PATH includes the folder with supabase.exe
- Try: `refreshenv` (if using Chocolatey) or restart computer
