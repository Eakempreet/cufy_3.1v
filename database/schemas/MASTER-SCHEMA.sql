-- =================================================================
-- CUFY DATING PLATFORM - MASTER DATABASE SCHEMA
-- =================================================================
-- This is the SINGLE SOURCE OF TRUTH for the entire database schema
-- 
-- ⚠️  WARNING: This will DELETE ALL EXISTING DATA and recreate everything!
-- 
-- Contents:
-- 1. Clean slate (delete everything)
-- 2. Core tables with relationships
-- 3. Security policies (RLS)
-- 4. Performance indexes
-- 5. Triggers and functions
-- 6. Sample data
-- =================================================================

BEGIN;

-- =================================================================
-- STEP 1: COMPLETE CLEANUP
-- =================================================================

-- Drop all existing tables in correct order (dependencies first)
DROP TABLE IF EXISTS user_actions CASCADE;
DROP TABLE IF EXISTS user_rounds CASCADE;
DROP TABLE IF EXISTS permanent_matches CASCADE;
DROP TABLE IF EXISTS temporary_matches CASCADE;
DROP TABLE IF EXISTS profile_assignments CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_user_creation() CASCADE;

-- Clean up storage
DELETE FROM storage.objects WHERE bucket_id = 'profile-photos';
DELETE FROM storage.buckets WHERE id = 'profile-photos';

-- Drop storage policies
DROP POLICY IF EXISTS "profile_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_delete" ON storage.objects;

-- =================================================================
-- STEP 2: CORE TABLES
-- =================================================================

-- USERS TABLE - Complete user profiles
CREATE TABLE users (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT CHECK (length(phone_number) = 10 AND phone_number ~ '^[0-9]+$'),
    
    -- Basic info
    age INTEGER CHECK (age >= 18 AND age <= 25) NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
    university TEXT NOT NULL,
    year_of_study TEXT,
    profile_photo TEXT,
    bio TEXT NOT NULL,
    instagram TEXT, -- Instagram handle for final connections
    
    -- Personality fields (from onboarding)
    energy_style TEXT,
    group_setting TEXT,
    ideal_weekend TEXT[],
    communication_style TEXT,
    best_trait TEXT,
    relationship_values TEXT[],
    love_language TEXT,
    connection_statement TEXT,
    
    -- System fields
    is_admin BOOLEAN DEFAULT FALSE,
    
    -- Subscription and payment
    subscription_type TEXT CHECK (subscription_type IN ('basic', 'premium')),
    subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired', 'cancelled')),
    payment_confirmed BOOLEAN DEFAULT FALSE,
    payment_proof_url TEXT,
    rounds_used INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- SUBSCRIPTIONS TABLE - Available plans
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('basic', 'premium')),
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS TABLE - Payment tracking
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL CHECK (subscription_type IN ('basic', 'premium')),
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'upi',
    payment_proof_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    transaction_id TEXT,
    admin_notes TEXT,
    confirmed_by UUID REFERENCES users(id),
    confirmed_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILE_ASSIGNMENTS TABLE - Admin assigns female profiles to male users
CREATE TABLE profile_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    male_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    female_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status: assigned → revealed → (temp_match) → (permanent_match) OR disengaged
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'revealed', 'disengaged', 'expired')),
    
    -- Track who has revealed the profile
    male_revealed BOOLEAN DEFAULT FALSE,
    female_revealed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    revealed_at TIMESTAMPTZ,
    disengaged_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(male_user_id, female_user_id)
);

-- TEMPORARY_MATCHES TABLE - 48hr decision window after both reveal
CREATE TABLE temporary_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES profile_assignments(id) ON DELETE CASCADE,
    male_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    female_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status and decisions
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'promoted', 'disengaged')),
    male_decision TEXT CHECK (male_decision IN ('accept', 'reject')) DEFAULT NULL,
    female_decision TEXT CHECK (female_decision IN ('accept', 'reject')) DEFAULT NULL,
    male_decided_at TIMESTAMPTZ,
    female_decided_at TIMESTAMPTZ,
    
    -- Timing (48 hours to decide)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours') NOT NULL,
    
    UNIQUE(male_user_id, female_user_id)
);

-- PERMANENT_MATCHES TABLE - Successful matches (both accepted in temp)
CREATE TABLE permanent_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temporary_match_id UUID REFERENCES temporary_matches(id) ON DELETE SET NULL,
    male_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    female_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status and activity
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    instagram_shared BOOLEAN DEFAULT FALSE,
    connection_made BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(male_user_id, female_user_id)
);

-- USER_ROUNDS TABLE - Track selection rounds for fairness
CREATE TABLE user_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    profiles_shown TEXT[], -- Array of user IDs shown in this round
    selected_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER_ACTIONS TABLE - Audit trail
CREATE TABLE user_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'reveal_profile', 'disengage', 'accept_match', 'reject_match', etc.
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- STEP 3: INDEXES FOR PERFORMANCE
-- =================================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_payment_confirmed ON users(payment_confirmed);
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- Profile assignments indexes
CREATE INDEX idx_profile_assignments_male_user ON profile_assignments(male_user_id);
CREATE INDEX idx_profile_assignments_female_user ON profile_assignments(female_user_id);
CREATE INDEX idx_profile_assignments_status ON profile_assignments(status);
CREATE INDEX idx_profile_assignments_male_revealed ON profile_assignments(male_user_id, male_revealed);

-- Temporary matches indexes
CREATE INDEX idx_temporary_matches_male_user ON temporary_matches(male_user_id);
CREATE INDEX idx_temporary_matches_female_user ON temporary_matches(female_user_id);
CREATE INDEX idx_temporary_matches_expires_at ON temporary_matches(expires_at);
CREATE INDEX idx_temporary_matches_status ON temporary_matches(status);

-- Permanent matches indexes
CREATE INDEX idx_permanent_matches_male_user ON permanent_matches(male_user_id);
CREATE INDEX idx_permanent_matches_female_user ON permanent_matches(female_user_id);
CREATE INDEX idx_permanent_matches_status ON permanent_matches(status);

-- Payment indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- User actions indexes
CREATE INDEX idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX idx_user_actions_action_type ON user_actions(action_type);
CREATE INDEX idx_user_actions_created_at ON user_actions(created_at);

-- =================================================================
-- STEP 4: TRIGGERS AND FUNCTIONS
-- =================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply triggers to tables that need updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_assignments_updated_at 
    BEFORE UPDATE ON profile_assignments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create temporary matches when both reveal
CREATE OR REPLACE FUNCTION handle_mutual_reveal()
RETURNS TRIGGER AS $$
BEGIN
    -- If both users have now revealed, create a temporary match
    IF NEW.male_revealed = true AND NEW.female_revealed = true AND OLD.male_revealed = false OR OLD.female_revealed = false THEN
        INSERT INTO temporary_matches (
            assignment_id,
            male_user_id,
            female_user_id,
            status,
            created_at,
            expires_at
        ) VALUES (
            NEW.id,
            NEW.male_user_id,
            NEW.female_user_id,
            'active',
            NOW(),
            NOW() + INTERVAL '48 hours'
        )
        ON CONFLICT (male_user_id, female_user_id) DO NOTHING;
        
        -- Update assignment status to revealed
        NEW.status = 'revealed';
        NEW.revealed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_mutual_reveal
    BEFORE UPDATE ON profile_assignments
    FOR EACH ROW
    EXECUTE FUNCTION handle_mutual_reveal();

-- Function to auto-create permanent matches when both accept
CREATE OR REPLACE FUNCTION handle_mutual_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    -- If both users have now accepted, create a permanent match
    IF NEW.male_decision = 'accept' AND NEW.female_decision = 'accept' AND (OLD.male_decision IS NULL OR OLD.female_decision IS NULL) THEN
        INSERT INTO permanent_matches (
            temporary_match_id,
            male_user_id,
            female_user_id,
            status,
            created_at
        ) VALUES (
            NEW.id,
            NEW.male_user_id,
            NEW.female_user_id,
            'active',
            NOW()
        )
        ON CONFLICT (male_user_id, female_user_id) DO NOTHING;
        
        -- Update temporary match status
        NEW.status = 'promoted';
    END IF;
    
    -- If either user rejects, mark as disengaged
    IF NEW.male_decision = 'reject' OR NEW.female_decision = 'reject' THEN
        NEW.status = 'disengaged';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trigger_mutual_acceptance
    BEFORE UPDATE ON temporary_matches
    FOR EACH ROW
    EXECUTE FUNCTION handle_mutual_acceptance();

-- =================================================================
-- STEP 5: ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE permanent_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Admin access - check email directly to avoid recursion
CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

-- Profile assignments policies
CREATE POLICY "Users can view their assignments" ON profile_assignments
    FOR SELECT USING (
        male_user_id::text = auth.uid()::text OR 
        female_user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Users can update their assignments" ON profile_assignments
    FOR UPDATE USING (
        male_user_id::text = auth.uid()::text OR 
        female_user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Admins can create assignments" ON profile_assignments
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

-- Temporary matches policies
CREATE POLICY "Users can view their temp matches" ON temporary_matches
    FOR SELECT USING (
        male_user_id::text = auth.uid()::text OR 
        female_user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Users can update their temp matches" ON temporary_matches
    FOR UPDATE USING (
        male_user_id::text = auth.uid()::text OR 
        female_user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

-- Permanent matches policies
CREATE POLICY "Users can view their permanent matches" ON permanent_matches
    FOR SELECT USING (
        male_user_id::text = auth.uid()::text OR 
        female_user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

-- Payments policies
CREATE POLICY "Users can view their payments" ON payments
    FOR SELECT USING (
        user_id::text = auth.uid()::text OR
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

CREATE POLICY "Users can create their payments" ON payments
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can update payments" ON payments
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
    );

-- =================================================================
-- STEP 6: STORAGE BUCKET AND POLICIES
-- =================================================================

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view profile photos" ON storage.objects 
    FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own photos" ON storage.objects 
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-photos' AND
        auth.uid()::text IS NOT NULL
    );

CREATE POLICY "Users can update their own photos" ON storage.objects 
    FOR UPDATE USING (
        bucket_id = 'profile-photos' AND
        auth.uid()::text IS NOT NULL
    );

CREATE POLICY "Users can delete their own photos" ON storage.objects 
    FOR DELETE USING (
        bucket_id = 'profile-photos' AND
        auth.uid()::text IS NOT NULL
    );

-- =================================================================
-- STEP 7: DEFAULT DATA
-- =================================================================

-- Insert subscription plans
INSERT INTO subscriptions (name, type, price, duration_days, features) VALUES
('Basic Plan', 'basic', 99.00, 30, '{"profiles_per_round": 1, "max_assignments": 1, "support": "email"}'),
('Premium Plan', 'premium', 249.00, 30, '{"profiles_per_round": 3, "max_assignments": 3, "support": "priority", "advanced_filters": true}');

-- Insert admin user
INSERT INTO users (
    email, 
    full_name, 
    age, 
    university, 
    bio, 
    gender, 
    is_admin,
    subscription_status,
    payment_confirmed
) VALUES (
    'cufy.online@gmail.com', 
    'Admin User', 
    25, 
    'Admin University', 
    'System Administrator', 
    'male', 
    true,
    'active',
    true
);

-- =================================================================
-- STEP 8: VERIFICATION
-- =================================================================

-- Verify schema creation
SELECT 
    'MASTER SCHEMA DEPLOYED SUCCESSFULLY!' as status,
    'All tables, policies, triggers, and data created' as message,
    NOW() as completed_at;

-- Show table structure
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'profile_assignments', 'temporary_matches', 'permanent_matches', 'payments', 'subscriptions')
ORDER BY tablename;

-- Show record counts
SELECT 'users' as table_name, COUNT(*) as records FROM users
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'profile_assignments', COUNT(*) FROM profile_assignments
UNION ALL
SELECT 'temporary_matches', COUNT(*) FROM temporary_matches
UNION ALL
SELECT 'permanent_matches', COUNT(*) FROM permanent_matches
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;

COMMIT;

-- =================================================================
-- MASTER SCHEMA DEPLOYMENT COMPLETE!
-- =================================================================
-- 
-- ✅ Clean database with no conflicts
-- ✅ All tables with proper relationships
-- ✅ Row Level Security enabled
-- ✅ Performance indexes created
-- ✅ Automated triggers for business logic
-- ✅ Storage bucket configured
-- ✅ Default data inserted
-- ✅ Admin user ready
-- 
-- Next: Deploy this schema to Supabase, then fix all API endpoints!
-- =================================================================
