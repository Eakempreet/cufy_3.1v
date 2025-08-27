-- Fix all database schema issues for admin panel
-- Run this script in your Supabase SQL editor

-- First, check if columns exist before adding them
-- Add profile_status column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'profile_status') THEN
        ALTER TABLE users ADD COLUMN profile_status text DEFAULT 'active' 
        CHECK (profile_status IN ('active', 'inactive', 'pending', 'suspended'));
    END IF;
END $$;

-- Add is_admin column to users table if it doesn't exist  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin boolean DEFAULT false;
    END IF;
END $$;

-- Ensure profile_assignments table has correct structure
DO $$ 
BEGIN
    -- Check if table exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'profile_assignments') THEN
        CREATE TABLE profile_assignments (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            male_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            female_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            male_revealed boolean DEFAULT false,
            female_revealed boolean DEFAULT false,
            status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disengaged')),
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(male_user_id, female_user_id)
        );
    END IF;
    
    -- Add male_revealed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profile_assignments' AND column_name = 'male_revealed') THEN
        ALTER TABLE profile_assignments ADD COLUMN male_revealed boolean DEFAULT false;
    END IF;
    
    -- Add female_revealed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profile_assignments' AND column_name = 'female_revealed') THEN
        ALTER TABLE profile_assignments ADD COLUMN female_revealed boolean DEFAULT false;
    END IF;
END $$;

-- Ensure permanent_matches table has correct structure
DO $$ 
BEGIN
    -- Check if table exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'permanent_matches') THEN
        CREATE TABLE permanent_matches (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            temporary_match_id uuid REFERENCES temporary_matches(id) ON DELETE SET NULL,
            male_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            female_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            status text DEFAULT 'active' CHECK (status IN ('active', 'disengaged')),
            male_disengaged boolean DEFAULT false,
            female_disengaged boolean DEFAULT false,
            male_accepted boolean DEFAULT false,
            female_accepted boolean DEFAULT false,
            is_active boolean DEFAULT true,
            UNIQUE(male_user_id, female_user_id)
        );
    END IF;
    
    -- Add male_disengaged column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permanent_matches' AND column_name = 'male_disengaged') THEN
        ALTER TABLE permanent_matches ADD COLUMN male_disengaged boolean DEFAULT false;
    END IF;
    
    -- Add female_disengaged column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permanent_matches' AND column_name = 'female_disengaged') THEN
        ALTER TABLE permanent_matches ADD COLUMN female_disengaged boolean DEFAULT false;
    END IF;
    
    -- Add male_accepted column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permanent_matches' AND column_name = 'male_accepted') THEN
        ALTER TABLE permanent_matches ADD COLUMN male_accepted boolean DEFAULT false;
    END IF;
    
    -- Add female_accepted column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permanent_matches' AND column_name = 'female_accepted') THEN
        ALTER TABLE permanent_matches ADD COLUMN female_accepted boolean DEFAULT false;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'permanent_matches' AND column_name = 'is_active') THEN
        ALTER TABLE permanent_matches ADD COLUMN is_active boolean DEFAULT true;
    END IF;
END $$;

-- Ensure temporary_matches table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'temporary_matches') THEN
        CREATE TABLE temporary_matches (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            assignment_id uuid REFERENCES profile_assignments(id) ON DELETE CASCADE,
            male_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            female_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            expires_at timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '48 hours') NOT NULL,
            status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'promoted', 'disengaged')),
            male_disengaged boolean DEFAULT false,
            female_disengaged boolean DEFAULT false,
            UNIQUE(male_user_id, female_user_id)
        );
    END IF;
END $$;

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_profile_status ON users(profile_status);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_male ON profile_assignments(male_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_female ON profile_assignments(female_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_status ON profile_assignments(status);
CREATE INDEX IF NOT EXISTS idx_temporary_matches_expires ON temporary_matches(expires_at);
CREATE INDEX IF NOT EXISTS idx_temporary_matches_status ON temporary_matches(status);
CREATE INDEX IF NOT EXISTS idx_permanent_matches_status ON permanent_matches(status);

-- Update admin user if exists, otherwise create one
INSERT INTO users (email, full_name, gender, is_admin, profile_status, 
                  phone_number, age, university, year_of_study, bio, 
                  energy_style, group_setting, ideal_weekend, communication_style, 
                  best_trait, relationship_values, love_language, connection_statement) 
VALUES ('cufy.online@gmail.com', 'Admin User', 'male', true, 'active',
        '+1234567890', 25, 'Admin University', 'Graduate', 'Admin bio',
        'High energy', 'Large groups', ARRAY['Working'], 'Direct',
        'Leadership', ARRAY['Trust'], 'Words of affirmation', 'Admin connection')
ON CONFLICT (email) 
DO UPDATE SET 
    is_admin = true, 
    profile_status = 'active',
    updated_at = timezone('utc'::text, now());

-- Create admin_actions table for logging (optional)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'admin_actions') THEN
        CREATE TABLE admin_actions (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            admin_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
            action_type text NOT NULL,
            target_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
            details jsonb,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_user_id);
        CREATE INDEX idx_admin_actions_target ON admin_actions(target_user_id);
        CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);
        CREATE INDEX idx_admin_actions_created ON admin_actions(created_at);
    END IF;
END $$;

SELECT 'Database schema update completed successfully!' as status;
