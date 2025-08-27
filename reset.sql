-- RESET SCRIPT - Run this FIRST to delete everything
-- This will completely clean your database and storage

-- Disable all triggers first
SET session_replication_role = replica;

-- Drop all tables in correct order (child tables first)
DROP TABLE IF EXISTS permanent_matches CASCADE;
DROP TABLE IF EXISTS temporary_matches CASCADE;
DROP TABLE IF EXISTS profile_assignments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS promote_temporary_match(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_assignment_limits(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS create_temporary_match_on_reveal() CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Remove ALL storage policies
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable upload for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for everyone" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_delete" ON storage.objects;

-- Delete storage bucket and all files
DELETE FROM storage.objects WHERE bucket_id = 'profile-photos';
DELETE FROM storage.buckets WHERE id = 'profile-photos';

-- Reset is complete
SELECT 'Database and storage completely reset' as status;
