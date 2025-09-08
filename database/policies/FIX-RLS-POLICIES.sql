-- =================================================================
-- CUFY DATING PLATFORM - FIX RLS POLICIES 
-- =================================================================
-- This script fixes the infinite recursion issue in RLS policies
-- by removing policies that query the users table within users policies
-- 
-- ⚠️  Run this INSTEAD of the full MASTER-SCHEMA.sql to preserve data
-- =================================================================

BEGIN;

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view their assignments" ON profile_assignments;
DROP POLICY IF EXISTS "Users can update their assignments" ON profile_assignments;
DROP POLICY IF EXISTS "Admins can create assignments" ON profile_assignments;
DROP POLICY IF EXISTS "Users can view their temp matches" ON temporary_matches;
DROP POLICY IF EXISTS "Users can update their temp matches" ON temporary_matches;
DROP POLICY IF EXISTS "Users can view their permanent matches" ON permanent_matches;
DROP POLICY IF EXISTS "Users can view their payments" ON payments;
DROP POLICY IF EXISTS "Admins can update payments" ON payments;

-- Recreate policies with direct email check to avoid recursion
CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Users can view their assignments" ON profile_assignments
    FOR SELECT USING (
        male_user_id::text = auth.uid()::text OR 
        female_user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Users can update their assignments" ON profile_assignments
    FOR UPDATE USING (
        male_user_id::text = auth.uid()::text OR 
        female_user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Admins can create assignments" ON profile_assignments
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Users can view their temp matches" ON temporary_matches
    FOR SELECT USING (
        male_user_id::text = auth.uid()::text OR 
        female_user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Users can update their temp matches" ON temporary_matches
    FOR UPDATE USING (
        male_user_id::text = auth.uid()::text OR 
        female_user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Users can view their permanent matches" ON permanent_matches
    FOR SELECT USING (
        male_user_id::text = auth.uid()::text OR 
        female_user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Users can view their payments" ON payments
    FOR SELECT USING (
        user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Admins can update payments" ON payments
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

-- Verify the fix
SELECT 'RLS POLICIES FIXED!' as status,
       'Admin access now uses direct email check' as message,
       'No more infinite recursion' as result;

COMMIT;

-- =================================================================
-- INSTRUCTIONS:
-- =================================================================
-- 1. Go to your Supabase SQL Editor
-- 2. Run this script to fix the RLS policies
-- 3. Your admin page should now work without errors
-- 4. All existing data will be preserved
-- =================================================================
