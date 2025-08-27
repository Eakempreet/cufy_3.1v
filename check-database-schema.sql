-- Diagnostic query to check what columns exist in each table
-- Run this in your Supabase SQL editor to see current schema

-- Check users table columns
SELECT 'users' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check profile_assignments table columns  
SELECT 'profile_assignments' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profile_assignments' 
ORDER BY ordinal_position;

-- Check temporary_matches table columns
SELECT 'temporary_matches' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'temporary_matches' 
ORDER BY ordinal_position;

-- Check permanent_matches table columns
SELECT 'permanent_matches' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'permanent_matches' 
ORDER BY ordinal_position;

-- List all tables in the current schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
