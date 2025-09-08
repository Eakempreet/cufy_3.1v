-- =================================================================
-- FIX: Add missing 'assigned_count' column to female_profile_stats
-- =================================================================
-- This script fixes the assignment error by adding the missing column
-- Run this in the Supabase SQL Editor

-- 1. Add the missing assigned_count column
ALTER TABLE female_profile_stats 
ADD COLUMN IF NOT EXISTS assigned_count integer DEFAULT 0;

-- 2. Set initial values based on existing data
UPDATE female_profile_stats 
SET assigned_count = currently_assigned_count;

-- 3. Create or update any triggers that use this column
-- (This ensures consistency between assigned_count and currently_assigned_count)

-- 4. Verify the fix
SELECT 
    'female_profile_stats' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'female_profile_stats' 
    AND column_name = 'assigned_count';

-- 5. Test query to ensure the column works
SELECT 
    female_user_id,
    assigned_count,
    currently_assigned_count,
    total_assigned_count
FROM female_profile_stats 
LIMIT 3;

-- 6. Create a function to keep both columns in sync (optional)
CREATE OR REPLACE FUNCTION sync_assigned_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update assigned_count to match currently_assigned_count
    NEW.assigned_count = NEW.currently_assigned_count;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to automatically sync the columns
DROP TRIGGER IF EXISTS sync_assigned_count_trigger ON female_profile_stats;
CREATE TRIGGER sync_assigned_count_trigger
    BEFORE UPDATE ON female_profile_stats
    FOR EACH ROW
    EXECUTE FUNCTION sync_assigned_count();

-- Success message
SELECT 'SUCCESS: assigned_count column added and synced!' as result;
