-- Fix profile_assignments table to align with API expectations
-- This migration aligns the database schema with the application code

-- First, add the missing columns
ALTER TABLE profile_assignments 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS revealed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS disengaged_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS male_revealed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS female_revealed BOOLEAN DEFAULT FALSE;

-- Update existing rows to have assigned_at = created_at if assigned_at is null
UPDATE profile_assignments 
SET assigned_at = created_at 
WHERE assigned_at IS NULL;

-- Migrate the old columns to new columns
-- male_viewed -> male_revealed
UPDATE profile_assignments 
SET male_revealed = male_viewed 
WHERE male_viewed IS NOT NULL;

-- female_viewed -> female_revealed  
UPDATE profile_assignments 
SET female_revealed = female_viewed 
WHERE female_viewed IS NOT NULL;

-- Update status values to align with API expectations
-- 'active' -> 'assigned' (default state)
UPDATE profile_assignments 
SET status = 'assigned' 
WHERE status = 'active';

-- 'matched' -> 'revealed' (when profile has been revealed)
UPDATE profile_assignments 
SET status = 'revealed',
    revealed_at = COALESCE(revealed_at, NOW())
WHERE status = 'matched' OR male_revealed = true;

-- 'expired' stays as is, but we'll treat it as 'assigned' for now
UPDATE profile_assignments 
SET status = 'assigned' 
WHERE status = 'expired';

-- Update the status constraint to match API expectations
ALTER TABLE profile_assignments 
DROP CONSTRAINT IF EXISTS profile_assignments_status_check;

ALTER TABLE profile_assignments 
ADD CONSTRAINT profile_assignments_status_check 
CHECK (status IN ('assigned', 'revealed', 'disengaged', 'expired'));

-- Drop the old columns after migration (optional - uncomment if you want to clean up)
-- ALTER TABLE profile_assignments DROP COLUMN IF EXISTS male_viewed;
-- ALTER TABLE profile_assignments DROP COLUMN IF EXISTS female_viewed;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_assignments_status ON profile_assignments(status);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_assigned_at ON profile_assignments(assigned_at);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_male_revealed ON profile_assignments(male_user_id, male_revealed);

-- Display current state for verification
SELECT 'Profile Assignments Schema Updated' as message;
SELECT 
    COUNT(*) as total_assignments,
    COUNT(*) FILTER (WHERE status = 'assigned') as assigned_count,
    COUNT(*) FILTER (WHERE status = 'revealed') as revealed_count,
    COUNT(*) FILTER (WHERE status = 'disengaged') as disengaged_count,
    COUNT(*) FILTER (WHERE male_revealed = true) as male_revealed_count
FROM profile_assignments;
