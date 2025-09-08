# =================================================================
# CUFY DATING PLATFORM - DEPLOYMENT INSTRUCTIONS
# =================================================================

## 🚀 QUICK DEPLOYMENT GUIDE

### Step 1: Environment Setup
1. Copy `.env.local.template` to `.env.local`
2. Fill in your actual Supabase and Google OAuth credentials
3. Generate a strong NEXTAUTH_SECRET: `openssl rand -base64 32`

### Step 2: Database Setup
1. Log in to your Supabase dashboard
2. Go to SQL Editor
3. Run the entire MASTER-SCHEMA.sql file
4. This will create all tables, RLS policies, triggers, and sample data

### Step 3: Google OAuth Setup
1. Go to Google Cloud Console
2. Create/select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (development)
   - https://your-domain.com/api/auth/callback/google (production)

### Step 4: Supabase Storage
The schema includes storage setup for:
- Profile photos bucket
- Payment proof bucket
Policies are automatically created by MASTER-SCHEMA.sql

### Step 5: Run the Application
```bash
npm install
npm run dev
```

## 🔧 ADMIN ACCESS
- Admin email: cufy.online@gmail.com
- Admin has access to /admin page
- Can confirm payments and assign profiles

## 📱 USER FLOW
1. User signs in with Google
2. Completes onboarding (male/female)
3. Males: Select subscription → Upload payment proof → Admin confirms → Get assignments
4. Females: Wait for reveals from assigned males → View/disengage
5. Both: Move to permanent matches when both engage

## 🛠️ TROUBLESHOOTING
- If you get "column doesn't exist" errors, make sure MASTER-SCHEMA.sql ran completely
- If payment confirmation doesn't work, check admin email access
- If assignments don't show, verify RLS policies are active

## 📊 MONITORING
- Check Supabase logs for any errors
- Monitor user registrations and payment confirmations
- Track assignment and match success rates
