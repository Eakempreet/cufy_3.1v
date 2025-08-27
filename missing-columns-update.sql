-- Add missing columns to tables
-- This script adds the timestamp columns that are referenced in the API but missing from the database

-- Add revealed_at column to temporary_matches table
ALTER TABLE temporary_matches 
ADD COLUMN IF NOT EXISTS revealed_at TIMESTAMPTZ;

-- Add assigned_at column to profile_assignments table  
ALTER TABLE profile_assignments 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();

-- Add matched_at column to permanent_matches table
ALTER TABLE permanent_matches 
ADD COLUMN IF NOT EXISTS matched_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing records to have timestamps where they are null
UPDATE temporary_matches 
SET revealed_at = created_at 
WHERE revealed_at IS NULL AND created_at IS NOT NULL;

UPDATE profile_assignments 
SET assigned_at = created_at 
WHERE assigned_at IS NULL AND created_at IS NOT NULL;

UPDATE permanent_matches 
SET matched_at = created_at 
WHERE matched_at IS NULL AND created_at IS NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN temporary_matches.revealed_at IS 'Timestamp when the temporary match was revealed to the user';
COMMENT ON COLUMN profile_assignments.assigned_at IS 'Timestamp when the profile was assigned';
COMMENT ON COLUMN permanent_matches.matched_at IS 'Timestamp when the permanent match was created';
