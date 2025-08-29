-- =================================================================
-- CUFY DATING PLATFORM - COMPLETE DATABASE SCHEMA
-- =================================================================
-- This is a complete schema that will DELETE ALL EXISTING DATA
-- and create a fresh, clean database aligned with the application
-- 
-- WARNING: This will delete all existing data!
-- Make sure to backup if needed before running this script
-- =================================================================

BEGIN;

-- =================================================================
-- STEP 1: CLEAN SLATE - DELETE ALL EXISTING DATA AND TABLES
-- =================================================================

-- Drop all existing tables and their dependencies
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS user_rounds CASCADE;
DROP TABLE IF EXISTS permanent_matches CASCADE;
DROP TABLE IF EXISTS temporary_matches CASCADE;
DROP TABLE IF EXISTS profile_assignments CASCADE;
DROP TABLE IF EXISTS user_actions CASCADE;
DROP TABLE IF EXISTS auth_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all existing functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop storage policies if they exist
DROP POLICY IF EXISTS "profile_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_delete" ON storage.objects;

-- Clean up storage objects first, then delete bucket
DELETE FROM storage.objects WHERE bucket_id = 'profile-photos';
DELETE FROM storage.buckets WHERE id = 'profile-photos';

-- =================================================================
-- STEP 2: CREATE FRESH SCHEMA WITH ALL REQUIRED TABLES
-- =================================================================

-- USERS TABLE - Core user profiles with all onboarding data
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT CHECK (length(phone_number) = 10 AND phone_number ~ '^[0-9]+$'),
    age INTEGER CHECK (age >= 18 AND age <= 25) NOT NULL,
    university TEXT NOT NULL,
    year_of_study TEXT,
    profile_photo TEXT,
    bio TEXT NOT NULL,
    
    -- Personality and preferences fields
    energy_style TEXT,
    group_setting TEXT,
    ideal_weekend TEXT[],
    communication_style TEXT,
    best_trait TEXT,
    relationship_values TEXT[],
    love_language TEXT,
    connection_statement TEXT,
    instagram TEXT, -- Instagram handle for connections
    
    -- Core system fields
    gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    
    -- Subscription and payment fields
    subscription_type TEXT CHECK (subscription_type IN ('basic', 'premium')),
    subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired', 'cancelled')),
    payment_confirmed BOOLEAN DEFAULT FALSE,
    payment_proof_url TEXT,
    rounds_used INTEGER DEFAULT 0,
    
    -- Timestamp fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- SUBSCRIPTIONS TABLE - Available subscription plans
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

-- PAYMENTS TABLE - Payment records and proof
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
    
    -- Status tracking - aligned with application code
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'revealed', 'disengaged', 'expired')),
    
    -- Reveal tracking
    male_revealed BOOLEAN DEFAULT FALSE,
    female_revealed BOOLEAN DEFAULT FALSE,
    
    -- Timestamp tracking
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    revealed_at TIMESTAMPTZ,
    disengaged_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique assignments
    UNIQUE(male_user_id, female_user_id)
);

-- TEMPORARY_MATCHES TABLE - When profiles are revealed, create 48hr decision window
CREATE TABLE temporary_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES profile_assignments(id) ON DELETE CASCADE,
    male_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    female_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Match status and disengagement tracking
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'promoted', 'disengaged')),
    male_disengaged BOOLEAN DEFAULT FALSE,
    female_disengaged BOOLEAN DEFAULT FALSE,
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours') NOT NULL,
    
    -- Ensure unique temporary matches
    UNIQUE(male_user_id, female_user_id)
);

-- PERMANENT_MATCHES TABLE - When both users accept in temporary match
CREATE TABLE permanent_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temporary_match_id UUID REFERENCES temporary_matches(id) ON DELETE SET NULL,
    male_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    female_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status tracking
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disengaged')),
    male_disengaged BOOLEAN DEFAULT FALSE,
    female_disengaged BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure unique permanent matches
    UNIQUE(male_user_id, female_user_id)
);

-- USER_ROUNDS TABLE - Track selection rounds for fairness
CREATE TABLE user_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    selected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER_ACTIONS TABLE - Log important user actions for analytics
CREATE TABLE user_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'reveal_profile', 'disengage', 'accept_match', etc.
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- STEP 3: CREATE PERFORMANCE INDEXES
-- =================================================================

-- User table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_payment_confirmed ON users(payment_confirmed);
CREATE INDEX idx_users_phone_number ON users(phone_number);

-- Profile assignments indexes
CREATE INDEX idx_profile_assignments_male_user ON profile_assignments(male_user_id);
CREATE INDEX idx_profile_assignments_female_user ON profile_assignments(female_user_id);
CREATE INDEX idx_profile_assignments_status ON profile_assignments(status);
CREATE INDEX idx_profile_assignments_assigned_at ON profile_assignments(assigned_at);
CREATE INDEX idx_profile_assignments_male_revealed ON profile_assignments(male_user_id, male_revealed);
CREATE INDEX idx_profile_assignments_revealed_at ON profile_assignments(revealed_at);

-- Temporary matches indexes
CREATE INDEX idx_temporary_matches_male_user ON temporary_matches(male_user_id);
CREATE INDEX idx_temporary_matches_female_user ON temporary_matches(female_user_id);
CREATE INDEX idx_temporary_matches_expires_at ON temporary_matches(expires_at);
CREATE INDEX idx_temporary_matches_status ON temporary_matches(status);

-- Permanent matches indexes
CREATE INDEX idx_permanent_matches_male_user ON permanent_matches(male_user_id);
CREATE INDEX idx_permanent_matches_female_user ON permanent_matches(female_user_id);
CREATE INDEX idx_permanent_matches_status ON permanent_matches(status);

-- Payment table indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_subscription_type ON payments(subscription_type);

-- User rounds indexes
CREATE INDEX idx_user_rounds_user_id ON user_rounds(user_id);
CREATE INDEX idx_user_rounds_selected_user ON user_rounds(selected_user_id);

-- User actions indexes
CREATE INDEX idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX idx_user_actions_action_type ON user_actions(action_type);
CREATE INDEX idx_user_actions_created_at ON user_actions(created_at);

-- =================================================================
-- STEP 4: CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =================================================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Apply the trigger to relevant tables
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

-- =================================================================
-- STEP 5: INSERT DEFAULT DATA
-- =================================================================

-- Insert default subscription plans
INSERT INTO subscriptions (name, type, price, duration_days, features) VALUES
('Basic Plan', 'basic', 99.00, 30, '{"profiles_per_round": 1, "max_rounds": 5, "support": "email"}'),
('Premium Plan', 'premium', 249.00, 30, '{"profiles_per_round": 3, "max_rounds": 10, "support": "priority", "advanced_filters": true}');

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
-- STEP 6: CREATE STORAGE BUCKET AND POLICIES
-- =================================================================

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile photos
CREATE POLICY "profile_photos_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'profile-photos');

-- =================================================================
-- STEP 7: VERIFICATION AND SUMMARY
-- =================================================================

-- Verify schema creation
SELECT 
    'SCHEMA CREATION COMPLETE!' as status,
    'All tables created successfully' as message,
    NOW() as completed_at;

-- Show table counts
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count 
FROM users

UNION ALL

SELECT 
    'subscriptions' as table_name, 
    COUNT(*) as record_count 
FROM subscriptions

UNION ALL

SELECT 
    'profile_assignments' as table_name, 
    COUNT(*) as record_count 
FROM profile_assignments

UNION ALL

SELECT 
    'temporary_matches' as table_name, 
    COUNT(*) as record_count 
FROM temporary_matches

UNION ALL

SELECT 
    'permanent_matches' as table_name, 
    COUNT(*) as record_count 
FROM permanent_matches

UNION ALL

SELECT 
    'payments' as table_name, 
    COUNT(*) as record_count 
FROM payments;

COMMIT;

-- =================================================================
-- SETUP COMPLETE!
-- =================================================================
-- 
-- The database is now ready with:
-- ✅ Clean, aligned schema matching application code
-- ✅ All required tables with proper relationships
-- ✅ Performance indexes for optimal queries
-- ✅ Automatic timestamp updates
-- ✅ Default subscription plans
-- ✅ Admin user account
-- ✅ Storage bucket for profile photos
-- ✅ Proper constraints and data validation
-- 
-- You can now run your application without schema mismatches!
-- =================================================================
