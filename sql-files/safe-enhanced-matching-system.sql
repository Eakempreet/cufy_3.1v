-- =================================================================
-- ENHANCED MATCHING SYSTEM - SAFE IMPLEMENTATION
-- =================================================================
-- This script safely enhances the existing schema with minimal risk
-- =================================================================

-- Step 1: Add essential columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 1;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS round_1_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS round_2_completed BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS decision_timer_active BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS decision_timer_expires_at TIMESTAMPTZ;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS decision_timer_started_at TIMESTAMPTZ;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS temp_match_id UUID;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS permanent_match_id UUID;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS match_confirmed_at TIMESTAMPTZ;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Add columns to profile_assignments
ALTER TABLE profile_assignments 
ADD COLUMN IF NOT EXISTS round_number INTEGER DEFAULT 1;

ALTER TABLE profile_assignments 
ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT FALSE;

ALTER TABLE profile_assignments 
ADD COLUMN IF NOT EXISTS selected_at TIMESTAMPTZ;

ALTER TABLE profile_assignments 
ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ;

ALTER TABLE profile_assignments 
ADD COLUMN IF NOT EXISTS timer_expires_at TIMESTAMPTZ;

-- Step 3: Add columns to temporary_matches
ALTER TABLE temporary_matches
ADD COLUMN IF NOT EXISTS round_number INTEGER DEFAULT 1;

ALTER TABLE temporary_matches
ADD COLUMN IF NOT EXISTS decision_timer_started_at TIMESTAMPTZ;

ALTER TABLE temporary_matches
ADD COLUMN IF NOT EXISTS auto_expire_at TIMESTAMPTZ;

ALTER TABLE temporary_matches
ADD COLUMN IF NOT EXISTS male_decision_made BOOLEAN DEFAULT FALSE;

ALTER TABLE temporary_matches
ADD COLUMN IF NOT EXISTS female_decision_made BOOLEAN DEFAULT FALSE;

ALTER TABLE temporary_matches
ADD COLUMN IF NOT EXISTS male_decision_at TIMESTAMPTZ;

ALTER TABLE temporary_matches
ADD COLUMN IF NOT EXISTS female_decision_at TIMESTAMPTZ;

-- Step 4: Create female_profile_stats table safely
CREATE TABLE IF NOT EXISTS female_profile_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    female_user_id UUID NOT NULL,
    currently_assigned_count INTEGER DEFAULT 0,
    assigned_count INTEGER DEFAULT 0,
    total_assigned_count INTEGER DEFAULT 0,
    selected_count INTEGER DEFAULT 0,
    revealed_count INTEGER DEFAULT 0,
    permanent_match_count INTEGER DEFAULT 0,
    last_assigned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(female_user_id)
);

-- Step 5: Add foreign key for female_profile_stats safely
DO $$ 
BEGIN
    ALTER TABLE female_profile_stats 
    ADD CONSTRAINT fk_female_profile_stats_user 
    FOREIGN KEY (female_user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION 
    WHEN duplicate_object THEN 
        NULL; -- Constraint already exists
END $$;

-- Step 6: Create essential indexes
CREATE INDEX IF NOT EXISTS idx_users_current_round ON users(current_round);
CREATE INDEX IF NOT EXISTS idx_users_decision_timer ON users(decision_timer_active, decision_timer_expires_at);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_round ON profile_assignments(round_number);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_selected ON profile_assignments(is_selected, selected_at);
CREATE INDEX IF NOT EXISTS idx_female_profile_stats_user ON female_profile_stats(female_user_id);

-- Step 7: Data migration for existing records
UPDATE users 
SET 
    current_round = 1,
    round_1_completed = FALSE,
    round_2_completed = FALSE,
    decision_timer_active = FALSE,
    last_activity_at = COALESCE(last_activity_at, created_at)
WHERE current_round IS NULL OR last_activity_at IS NULL;

UPDATE profile_assignments 
SET round_number = 1 
WHERE round_number IS NULL;

-- Step 8: Initialize female profile stats
INSERT INTO female_profile_stats (female_user_id, currently_assigned_count, assigned_count, total_assigned_count)
SELECT 
    u.id,
    COALESCE(assigned_count.count, 0),
    COALESCE(assigned_count.count, 0),
    COALESCE(total_count.count, 0)
FROM users u
LEFT JOIN (
    SELECT female_user_id, COUNT(*) as count
    FROM profile_assignments 
    WHERE status = 'assigned'
    GROUP BY female_user_id
) assigned_count ON u.id = assigned_count.female_user_id
LEFT JOIN (
    SELECT female_user_id, COUNT(*) as count
    FROM profile_assignments 
    GROUP BY female_user_id
) total_count ON u.id = total_count.female_user_id
WHERE u.gender = 'female'
ON CONFLICT (female_user_id) DO NOTHING;

-- Step 9: Helper functions
CREATE OR REPLACE FUNCTION get_max_assignments(user_subscription TEXT, round_num INTEGER)
RETURNS INTEGER AS $$
BEGIN
    IF user_subscription = 'premium' THEN
        RETURN CASE WHEN round_num = 1 THEN 2 ELSE 3 END;
    ELSE
        RETURN 1; -- Basic users get 1 assignment per round
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION can_assign_more_profiles(user_id UUID, round_num INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    user_subscription TEXT;
    current_assignments INTEGER;
    max_assignments INTEGER;
BEGIN
    SELECT subscription_type INTO user_subscription 
    FROM users 
    WHERE id = user_id;
    
    SELECT COUNT(*) INTO current_assignments
    FROM profile_assignments 
    WHERE male_user_id = user_id 
    AND round_number = round_num 
    AND status = 'assigned';
    
    max_assignments := get_max_assignments(user_subscription, round_num);
    
    RETURN current_assignments < max_assignments;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Verification
SELECT 
    'enhanced_schema_ready' as status,
    'Essential enhancements applied successfully' as message,
    NOW() as completed_at;

SELECT 
    'users' as table_name, 
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE gender = 'male') as male_users,
    COUNT(*) FILTER (WHERE gender = 'female') as female_users,
    COUNT(*) FILTER (WHERE payment_confirmed = true) as confirmed_payments
FROM users

UNION ALL

SELECT 
    'profile_assignments' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'assigned') as assigned,
    COUNT(*) FILTER (WHERE status = 'revealed') as revealed,
    COUNT(*) FILTER (WHERE is_selected = true) as selected
FROM profile_assignments

UNION ALL

SELECT 
    'female_profile_stats' as table_name,
    COUNT(*) as total_records,
    AVG(currently_assigned_count)::INTEGER as avg_assigned,
    MAX(currently_assigned_count) as max_assigned,
    SUM(selected_count) as total_selections
FROM female_profile_stats;
