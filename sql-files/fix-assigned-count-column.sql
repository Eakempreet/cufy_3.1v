-- Fix for the female_profile_stats assigned_count column issue
-- This script adds the missing assigned_count column or updates references

-- Option 1: Add the missing assigned_count column (if it's supposed to be separate)
ALTER TABLE female_profile_stats 
ADD COLUMN IF NOT EXISTS assigned_count integer DEFAULT 0;

-- Option 2: Create a view or update any functions/triggers that reference assigned_count
-- Let's first check what triggers exist on profile_assignments

-- Update any triggers or functions that might be referencing the wrong column name
-- This is likely a trigger that's trying to update assigned_count instead of currently_assigned_count

-- For now, let's add the column and set it equal to currently_assigned_count
UPDATE female_profile_stats 
SET assigned_count = currently_assigned_count 
WHERE assigned_count IS DISTINCT FROM currently_assigned_count;
