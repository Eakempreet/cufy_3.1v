-- CRITICAL SCHEMA ALIGNMENT FIX
-- This script fixes the profile_assignments table to match the application code
-- Run this in your Supabase SQL editor

BEGIN;

-- Step 1: Add missing columns to profile_assignments table
ALTER TABLE profile_assignments 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS revealed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS disengaged_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS male_revealed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS female_revealed BOOLEAN DEFAULT FALSE;

-- Step 2: Set assigned_at for existing records (use created_at as fallback)
UPDATE profile_assignments 
SET assigned_at = COALESCE(assigned_at, created_at, NOW())
WHERE assigned_at IS NULL;

-- Step 3: Migrate existing data from old columns to new columns
-- male_viewed -> male_revealed (if old column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='profile_assignments' AND column_name='male_viewed') THEN
        UPDATE profile_assignments 
        SET male_revealed = COALESCE(male_viewed, FALSE);
    END IF;
END $$;

-- female_viewed -> female_revealed (if old column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='profile_assignments' AND column_name='female_viewed') THEN
        UPDATE profile_assignments 
        SET female_revealed = COALESCE(female_viewed, FALSE);
    END IF;
END $$;

-- Step 4: Fix status values to match API expectations
-- Update 'active' -> 'assigned'
UPDATE profile_assignments 
SET status = 'assigned' 
WHERE status = 'active';

-- Update 'matched' -> 'revealed' and set revealed_at
UPDATE profile_assignments 
SET status = 'revealed',
    revealed_at = COALESCE(revealed_at, NOW())
WHERE status = 'matched';

-- Handle any profiles that should be revealed based on male_revealed flag
UPDATE profile_assignments 
SET status = 'revealed',
    revealed_at = COALESCE(revealed_at, NOW())
WHERE male_revealed = true AND status != 'revealed';

-- Update 'expired' -> 'assigned' (or keep as 'expired' if you want)
UPDATE profile_assignments 
SET status = 'assigned' 
WHERE status = 'expired';

-- Step 5: Update status constraint to include new values
ALTER TABLE profile_assignments 
DROP CONSTRAINT IF EXISTS profile_assignments_status_check;

ALTER TABLE profile_assignments 
ADD CONSTRAINT profile_assignments_status_check 
CHECK (status IN ('assigned', 'revealed', 'disengaged', 'active', 'expired', 'matched'));

-- Step 6: Set default value for assigned_at column
ALTER TABLE profile_assignments 
ALTER COLUMN assigned_at SET DEFAULT NOW();

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_assignments_status ON profile_assignments(status);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_assigned_at ON profile_assignments(assigned_at);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_male_revealed ON profile_assignments(male_user_id, male_revealed);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_revealed_at ON profile_assignments(revealed_at);

-- Step 8: Verification query
SELECT 
    'Schema Update Complete' as message,
    COUNT(*) as total_assignments,
    COUNT(*) FILTER (WHERE status = 'assigned') as assigned_count,
    COUNT(*) FILTER (WHERE status = 'revealed') as revealed_count,
    COUNT(*) FILTER (WHERE status = 'disengaged') as disengaged_count,
    COUNT(*) FILTER (WHERE male_revealed = true) as male_revealed_count,
    COUNT(*) FILTER (WHERE assigned_at IS NOT NULL) as with_assigned_at
FROM profile_assignments;

COMMIT;

-- Optional cleanup (uncomment if you want to remove old columns)
-- ALTER TABLE profile_assignments DROP COLUMN IF EXISTS male_viewed;
-- ALTER TABLE profile_assignments DROP COLUMN IF EXISTS female_viewed;
