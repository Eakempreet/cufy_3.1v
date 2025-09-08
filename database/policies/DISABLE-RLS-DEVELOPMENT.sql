-- =================================================================
-- CUFY DATING PLATFORM - DISABLE RLS FOR DEVELOPMENT
-- =================================================================
-- This script temporarily disables RLS to allow unrestricted access
-- Use this for development/testing, re-enable for production
-- 
-- ⚠️  DEVELOPMENT ONLY - NOT FOR PRODUCTION!
-- =================================================================

BEGIN;

-- =================================================================
-- DISABLE RLS ON ALL TABLES
-- =================================================================

-- Disable RLS on core tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE permanent_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_rounds DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view their assignments" ON profile_assignments;
DROP POLICY IF EXISTS "Users can update their assignments" ON profile_assignments;
DROP POLICY IF EXISTS "Admins can create assignments" ON profile_assignments;
DROP POLICY IF EXISTS "Users can view their temp matches" ON temporary_matches;
DROP POLICY IF EXISTS "Users can update their temp matches" ON temporary_matches;
DROP POLICY IF EXISTS "Users can view their permanent matches" ON permanent_matches;
DROP POLICY IF EXISTS "Users can view their payments" ON payments;
DROP POLICY IF EXISTS "Users can create their payments" ON payments;
DROP POLICY IF EXISTS "Admins can update payments" ON payments;

-- Also disable RLS on storage objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Drop storage policies
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

-- =================================================================
-- ENSURE ADMIN USER EXISTS
-- =================================================================

-- Insert or update admin user
INSERT INTO users (
    email, 
    full_name, 
    age, 
    university, 
    bio, 
    gender, 
    is_admin,
    subscription_status,
    payment_confirmed,
    created_at,
    updated_at
) VALUES (
    'cufy.online@gmail.com', 
    'Admin User', 
    25, 
    'Admin University', 
    'System Administrator', 
    'male', 
    true,
    'active',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    is_admin = true,
    subscription_status = 'active',
    payment_confirmed = true,
    updated_at = NOW();

-- =================================================================
-- VERIFY THE CHANGES
-- =================================================================

-- Check table security status
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS_ENABLED"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'profile_assignments', 'temporary_matches', 'permanent_matches', 'payments', 'subscriptions')
ORDER BY tablename;

-- Check admin user
SELECT 
    'ADMIN USER STATUS' as check_type,
    email,
    full_name,
    is_admin,
    subscription_status,
    payment_confirmed
FROM users 
WHERE email = 'cufy.online@gmail.com';

-- Success message
SELECT 
    'RLS DISABLED FOR DEVELOPMENT!' as status,
    'All tables now have unrestricted access' as message,
    'Admin user exists and configured' as admin_status,
    'You can now create profiles without restrictions' as result;

COMMIT;

-- =================================================================
-- INSTRUCTIONS:
-- =================================================================
-- 1. Run this script in Supabase SQL Editor
-- 2. All RLS restrictions are now removed
-- 3. You can create/edit profiles freely
-- 4. Admin panel should work perfectly
-- 5. All database operations should work without policy errors
-- 
-- ⚠️  REMEMBER: Re-enable RLS before going to production!
-- =================================================================
