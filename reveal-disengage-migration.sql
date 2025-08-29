-- Migration script to add reveal functionality and disengage columns
-- Run this in your Supabase SQL editor

-- Add columns to profile_assignments table for reveal functionality
ALTER TABLE profile_assignments 
ADD COLUMN IF NOT EXISTS male_revealed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS female_revealed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'assigned',
ADD COLUMN IF NOT EXISTS revealed_at TIMESTAMP WITH TIME ZONE;

-- Add columns to temporary_matches table for proper disengage functionality
ALTER TABLE temporary_matches 
ADD COLUMN IF NOT EXISTS male_disengaged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS female_disengaged BOOLEAN DEFAULT FALSE;

-- Update existing records to have proper default values
UPDATE profile_assignments 
SET status = 'assigned' 
WHERE status IS NULL;

UPDATE profile_assignments 
SET male_revealed = FALSE 
WHERE male_revealed IS NULL;

UPDATE profile_assignments 
SET female_revealed = FALSE 
WHERE female_revealed IS NULL;

UPDATE temporary_matches 
SET male_disengaged = FALSE 
WHERE male_disengaged IS NULL;

UPDATE temporary_matches 
SET female_disengaged = FALSE 
WHERE female_disengaged IS NULL;

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_profile_assignments_status ON profile_assignments(status);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_revealed ON profile_assignments(male_revealed, female_revealed);
CREATE INDEX IF NOT EXISTS idx_temporary_matches_disengaged ON temporary_matches(male_disengaged, female_disengaged);

-- Create optional user_actions table for logging (if it doesn't exist)
CREATE TABLE IF NOT EXISTS user_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_actions for performance
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at);

-- Add comments for clarity
COMMENT ON COLUMN profile_assignments.male_revealed IS 'Whether the male user has revealed this profile';
COMMENT ON COLUMN profile_assignments.female_revealed IS 'Whether the female user has seen the revealed profile';
COMMENT ON COLUMN profile_assignments.status IS 'Status of assignment: assigned, revealed, completed';
COMMENT ON COLUMN profile_assignments.revealed_at IS 'When the profile was first revealed';

COMMENT ON COLUMN temporary_matches.male_disengaged IS 'Whether the male user has disengaged from this match';
COMMENT ON COLUMN temporary_matches.female_disengaged IS 'Whether the female user has disengaged from this match';

COMMENT ON TABLE user_actions IS 'Log of user actions for audit and analytics';
