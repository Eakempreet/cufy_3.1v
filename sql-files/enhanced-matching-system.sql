-- =================================================================
-- ENHANCED MATCHING SYSTEM - ROBUST ROUND & TIMER IMPLEMENTATION
-- =================================================================
-- This script enhances the existing schema with proper round management,
-- timer systems, and synchronized matching logic
-- =================================================================

-- Add missing columns to users table for enhanced functionality
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS round_1_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS round_2_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS decision_timer_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS decision_timer_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS decision_timer_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS temp_match_id UUID,
ADD COLUMN IF NOT EXISTS permanent_match_id UUID,
ADD COLUMN IF NOT EXISTS match_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Add round number to profile_assignments
ALTER TABLE profile_assignments 
ADD COLUMN IF NOT EXISTS round_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS selected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS timer_expires_at TIMESTAMPTZ;

-- Add enhanced tracking to temporary_matches
ALTER TABLE temporary_matches
ADD COLUMN IF NOT EXISTS round_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS decision_timer_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_expire_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS male_decision_made BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS female_decision_made BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS male_decision_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS female_decision_at TIMESTAMPTZ;

-- Create female_profile_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS female_profile_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    female_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Create admin_notes table for admin tracking
CREATE TABLE IF NOT EXISTS admin_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL,
    target_user_id UUID,
    note_type TEXT NOT NULL CHECK (note_type IN ('assignment', 'match', 'payment', 'general')),
    note_content TEXT NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_current_round ON users(current_round);
CREATE INDEX IF NOT EXISTS idx_users_decision_timer ON users(decision_timer_active, decision_timer_expires_at);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_round ON profile_assignments(round_number);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_selected ON profile_assignments(is_selected, selected_at);
CREATE INDEX IF NOT EXISTS idx_female_profile_stats_user ON female_profile_stats(female_user_id);

-- Create admin_notes index only if the table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_notes') THEN
        CREATE INDEX IF NOT EXISTS idx_admin_notes_target_user ON admin_notes(target_user_id);
    END IF;
EXCEPTION 
    WHEN OTHERS THEN 
        NULL; -- Ignore any errors creating this index
END $$;

-- Add foreign key constraints after table creation (to avoid reference order issues)
DO $$ 
BEGIN
    -- Add foreign key for temp_match_id if temporary_matches table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'temporary_matches') THEN
        ALTER TABLE users 
        ADD CONSTRAINT fk_users_temp_match 
        FOREIGN KEY (temp_match_id) REFERENCES temporary_matches(id) 
        ON DELETE SET NULL;
    END IF;
    
    -- Add foreign key for permanent_match_id if permanent_matches table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permanent_matches') THEN
        ALTER TABLE users 
        ADD CONSTRAINT fk_users_permanent_match 
        FOREIGN KEY (permanent_match_id) REFERENCES permanent_matches(id) 
        ON DELETE SET NULL;
    END IF;
    
    -- Add foreign keys for admin_notes table
    ALTER TABLE admin_notes 
    ADD CONSTRAINT fk_admin_notes_admin_user 
    FOREIGN KEY (admin_user_id) REFERENCES users(id) 
    ON DELETE CASCADE;
    
    ALTER TABLE admin_notes 
    ADD CONSTRAINT fk_admin_notes_target_user 
    FOREIGN KEY (target_user_id) REFERENCES users(id) 
    ON DELETE CASCADE;
    
EXCEPTION 
    WHEN duplicate_object THEN 
        NULL; -- Ignore if constraints already exist
END $$;

-- =================================================================
-- TRIGGER FUNCTIONS FOR AUTOMATIC STATS UPDATES
-- =================================================================

-- Function to update female profile stats when assignments change
CREATE OR REPLACE FUNCTION update_female_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        INSERT INTO female_profile_stats (female_user_id, currently_assigned_count, assigned_count, total_assigned_count, last_assigned_at)
        VALUES (NEW.female_user_id, 1, 1, 1, NEW.assigned_at)
        ON CONFLICT (female_user_id) 
        DO UPDATE SET 
            currently_assigned_count = CASE 
                WHEN NEW.status = 'assigned' THEN female_profile_stats.currently_assigned_count + 1
                ELSE female_profile_stats.currently_assigned_count
            END,
            assigned_count = CASE 
                WHEN NEW.status = 'assigned' THEN female_profile_stats.assigned_count + 1
                ELSE female_profile_stats.assigned_count
            END,
            total_assigned_count = female_profile_stats.total_assigned_count + 1,
            last_assigned_at = NEW.assigned_at,
            updated_at = NOW();
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- If status changed from assigned to something else, decrease counts
        IF OLD.status = 'assigned' AND NEW.status != 'assigned' THEN
            UPDATE female_profile_stats 
            SET 
                currently_assigned_count = GREATEST(0, currently_assigned_count - 1),
                updated_at = NOW()
            WHERE female_user_id = NEW.female_user_id;
        END IF;
        
        -- If status changed to assigned from something else, increase counts
        IF OLD.status != 'assigned' AND NEW.status = 'assigned' THEN
            UPDATE female_profile_stats 
            SET 
                currently_assigned_count = currently_assigned_count + 1,
                assigned_count = assigned_count + 1,
                updated_at = NOW()
            WHERE female_user_id = NEW.female_user_id;
        END IF;
        
        -- Track selections
        IF NEW.is_selected = TRUE AND (OLD.is_selected IS NULL OR OLD.is_selected = FALSE) THEN
            UPDATE female_profile_stats 
            SET 
                selected_count = selected_count + 1,
                updated_at = NOW()
            WHERE female_user_id = NEW.female_user_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        UPDATE female_profile_stats 
        SET 
            currently_assigned_count = GREATEST(0, currently_assigned_count - 1),
            updated_at = NOW()
        WHERE female_user_id = OLD.female_user_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile assignments
DROP TRIGGER IF EXISTS trigger_update_female_stats ON profile_assignments;
CREATE TRIGGER trigger_update_female_stats
    AFTER INSERT OR UPDATE OR DELETE ON profile_assignments
    FOR EACH ROW EXECUTE FUNCTION update_female_profile_stats();

-- =================================================================
-- HELPER FUNCTIONS FOR MATCHING SYSTEM
-- =================================================================

-- Function to get user's max assignments based on subscription
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

-- Function to check if user can be assigned more profiles
CREATE OR REPLACE FUNCTION can_assign_more_profiles(user_id UUID, round_num INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    user_subscription TEXT;
    current_assignments INTEGER;
    max_assignments INTEGER;
BEGIN
    -- Get user subscription type
    SELECT subscription_type INTO user_subscription 
    FROM users 
    WHERE id = user_id;
    
    -- Get current assignments count for this round
    SELECT COUNT(*) INTO current_assignments
    FROM profile_assignments 
    WHERE male_user_id = user_id 
    AND round_number = round_num 
    AND status = 'assigned';
    
    -- Get max assignments for this subscription and round
    max_assignments := get_max_assignments(user_subscription, round_num);
    
    RETURN current_assignments < max_assignments;
END;
$$ LANGUAGE plpgsql;

-- Function to start decision timer when profile is selected
CREATE OR REPLACE FUNCTION start_decision_timer(assignment_id UUID)
RETURNS VOID AS $$
DECLARE
    male_id UUID;
    expires_at TIMESTAMPTZ;
BEGIN
    -- Get male user ID
    SELECT male_user_id INTO male_id 
    FROM profile_assignments 
    WHERE id = assignment_id;
    
    -- Set timer to expire in 48 hours
    expires_at := NOW() + INTERVAL '48 hours';
    
    -- Update assignment with timer info
    UPDATE profile_assignments 
    SET 
        is_selected = TRUE,
        selected_at = NOW(),
        timer_started_at = NOW(),
        timer_expires_at = expires_at,
        status = 'revealed'
    WHERE id = assignment_id;
    
    -- Update user with decision timer
    UPDATE users 
    SET 
        decision_timer_active = TRUE,
        decision_timer_started_at = NOW(),
        decision_timer_expires_at = expires_at,
        last_activity_at = NOW()
    WHERE id = male_id;
    
    -- Hide other assigned profiles for this user
    UPDATE profile_assignments 
    SET status = 'hidden'
    WHERE male_user_id = male_id 
    AND id != assignment_id 
    AND status = 'assigned';
    
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- DATA MIGRATION FOR EXISTING RECORDS
-- =================================================================

-- Ensure all users have proper round and timer defaults
UPDATE users 
SET 
    current_round = 1,
    round_1_completed = FALSE,
    round_2_completed = FALSE,
    decision_timer_active = FALSE,
    last_activity_at = COALESCE(last_activity_at, created_at)
WHERE current_round IS NULL OR last_activity_at IS NULL;

-- Ensure all profile assignments have round numbers
UPDATE profile_assignments 
SET round_number = 1 
WHERE round_number IS NULL;

-- Initialize female profile stats for existing female users
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

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- Check schema updates
SELECT 
    'enhanced_schema_ready' as status,
    'All tables and functions created successfully' as message,
    NOW() as completed_at;

-- Show table statistics
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

-- Show matching system status
SELECT 
    'MATCHING SYSTEM STATUS' as info,
    'Ready for enhanced admin panel operations' as status;
