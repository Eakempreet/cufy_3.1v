-- Check if the migration columns exist
-- Run this in Supabase SQL Editor to verify migration status

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('profile_assignments', 'temporary_matches')
    AND column_name IN ('male_revealed', 'female_revealed', 'status', 'revealed_at', 'male_disengaged', 'female_disengaged')
ORDER BY table_name, ordinal_position;

-- Check current data in profile_assignments
SELECT 
    id,
    male_user_id,
    female_user_id,
    status,
    male_revealed,
    female_revealed,
    revealed_at,
    created_at
FROM profile_assignments
LIMIT 5;

-- Check current data in temporary_matches
SELECT 
    id,
    male_user_id,
    female_user_id,
    male_disengaged,
    female_disengaged,
    expires_at,
    created_at
FROM temporary_matches
LIMIT 5;
