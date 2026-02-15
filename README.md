# CashLink - African Community Platform in UAE

A self-hosted community platform connecting Africans in UAE with money agents, businesses, jobs, events, and marketplace services.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Vercel account (for deployment)

### 1. Clone and Install

```bash
cd CashLink
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings > API
3. Create `.env` file:

```bash
cp .env.example .env
```

4. Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CURRENCY_API_KEY=your-free-api-key  # Get from exchangerate-api.com
```

### 3. Run Database Migrations

In your Supabase dashboard, go to SQL Editor and run the migration files in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates all tables
2. `supabase/migrations/002_rls_policies.sql` - Sets up security policies
3. `supabase/migrations/003_storage_setup.sql` - Configures file storage

Or using Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

### 4. Deploy Edge Functions

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy update-user-role
supabase functions deploy approve-content
supabase functions deploy approve-subscription
supabase functions deploy approve-promotion
supabase functions deploy process-transaction
supabase functions deploy send-bulk-notifications
supabase functions deploy notify-admin-role-request
supabase functions deploy notify-admin-content-creation
supabase functions deploy notify-admin-subscription-request
supabase functions deploy send-email
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📦 Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CURRENCY_API_KEY`
4. Deploy!

## 🏗️ Project Structure

```
CashLink/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ui/             # Shadcn UI components
│   │   └── Layout.jsx      # Main layout
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx # Authentication context
│   ├── entities/           # Supabase entity wrappers
│   ├── functions/          # Frontend function wrappers
│   ├── integrations/       # Core integrations (upload, currency)
│   ├── lib/                # Utilities
│   ├── pages/              # Page components
│   ├── utils/              # Helper functions
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── supabase/
│   ├── functions/          # Edge Functions (Deno)
│   └── migrations/         # SQL migrations
├── index.html              # HTML template
├── package.json
├── vite.config.js
├── tailwind.config.js
└── vercel.json
```

## 🔐 Authentication

The app uses Supabase Auth with email/password authentication. The `AuthContext` provides:

- `user` - Current authenticated user
- `profile` - User profile from database
- `signIn(email, password)` - Sign in
- `signUp(email, password, metadata)` - Sign up
- `signOut()` - Sign out
- `updateProfile(updates)` - Update profile
- `isAdmin`, `isAgent`, `isVendor`, `isDriver` - Role checks

## 💰 Currency Conversion

Currency conversion is handled by the free [ExchangeRate-API](https://www.exchangerate-api.com/). Get a free API key (1,500 requests/month) and add it to your environment variables.

## 📧 Email (Optional)

For email notifications, set up [Resend](https://resend.com):

1. Create a Resend account
2. Add your domain and verify it
3. Add the API key to your Supabase Edge Function secrets:

```bash
supabase secrets set RESEND_API_KEY=your-resend-api-key
```

## 🛡️ Row Level Security

All tables have RLS policies enabled. Key policies:

- Users can only see their own profile data
- Only admins can manage users and approve content
- Content creators can edit their own items
- Approved content is visible to all users

## 📱 Features

- **Money Agents** - Find and connect with trusted money transfer agents
- **Businesses** - Directory of African-owned businesses in UAE
- **Jobs** - Job postings for the community
- **Events** - Community events and gatherings
- **Marketplace** - Buy and sell items
- **Lost & Found** - Report and find lost items
- **Emergency Services** - Quick access to emergency contacts
- **UAE Help Center** - Resources for newcomers

## 🧪 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📝 Moving Existing Pages

Your existing pages in the `Pages/` folder need to be moved to `src/pages/` with updated imports:

1. Move all `.jsx` files from `Pages/` to `src/pages/`
2. Update imports from `@/entities/X` to use the new Supabase wrappers
3. Remove any `base44` SDK imports
4. Update `createPageUrl()` calls to use React Router's `useNavigate()`

Example import changes:

```javascript
// Before (Base44)
import { User } from "@/entities/User";
import { InvokeLLM } from "npm:@base44/sdk";

// After (Supabase)
import { User } from "@/entities/User";
import { convertCurrency } from "@/integrations/Core";
```

## 🆘 Troubleshooting

### Auth not working
- Check Supabase URL and anon key are correct
- Ensure RLS policies are applied
- Check browser console for errors

### Edge functions failing
- Verify functions are deployed: `supabase functions list`
- Check function logs: `supabase functions logs <function-name>`
- Ensure SUPABASE_SERVICE_ROLE_KEY is set in function environment

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript/JSX errors in console

## 📄 License

MIT License - feel free to use this for your community!

---

Built with ❤️ for the African community in UAE
