-- Add missing status columns to tables
-- Run this in your Supabase SQL editor

-- Add status column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status text DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'suspended', 'pending'));
        RAISE NOTICE 'Added status column to users table';
    ELSE
        RAISE NOTICE 'Status column already exists in users table';
    END IF;
END $$;

-- Add profile_status column to users table if it doesn't exist (separate from status)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'profile_status') THEN
        ALTER TABLE users ADD COLUMN profile_status text DEFAULT 'active' 
        CHECK (profile_status IN ('active', 'inactive', 'pending', 'suspended'));
        RAISE NOTICE 'Added profile_status column to users table';
    ELSE
        RAISE NOTICE 'Profile_status column already exists in users table';
    END IF;
END $$;

-- Add is_admin column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin boolean DEFAULT false;
        RAISE NOTICE 'Added is_admin column to users table';
    ELSE
        RAISE NOTICE 'Is_admin column already exists in users table';
    END IF;
END $$;

-- Check if profile_assignments table exists, if not create it
DO $$ 
BEGIN
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
        RAISE NOTICE 'Created profile_assignments table';
    ELSE
        -- Add missing columns to existing table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'profile_assignments' AND column_name = 'status') THEN
            ALTER TABLE profile_assignments ADD COLUMN status text DEFAULT 'active' 
            CHECK (status IN ('active', 'expired', 'disengaged'));
            RAISE NOTICE 'Added status column to profile_assignments table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'profile_assignments' AND column_name = 'male_revealed') THEN
            ALTER TABLE profile_assignments ADD COLUMN male_revealed boolean DEFAULT false;
            RAISE NOTICE 'Added male_revealed column to profile_assignments table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'profile_assignments' AND column_name = 'female_revealed') THEN
            ALTER TABLE profile_assignments ADD COLUMN female_revealed boolean DEFAULT false;
            RAISE NOTICE 'Added female_revealed column to profile_assignments table';
        END IF;
    END IF;
END $$;

-- Check if temporary_matches table exists, if not create it  
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
        RAISE NOTICE 'Created temporary_matches table';
    ELSE
        -- Add status column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'temporary_matches' AND column_name = 'status') THEN
            ALTER TABLE temporary_matches ADD COLUMN status text DEFAULT 'active' 
            CHECK (status IN ('active', 'expired', 'promoted', 'disengaged'));
            RAISE NOTICE 'Added status column to temporary_matches table';
        END IF;
    END IF;
END $$;

-- Check if permanent_matches table exists, if not create it
DO $$ 
BEGIN
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
        RAISE NOTICE 'Created permanent_matches table';
    ELSE
        -- Add missing columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'permanent_matches' AND column_name = 'status') THEN
            ALTER TABLE permanent_matches ADD COLUMN status text DEFAULT 'active' 
            CHECK (status IN ('active', 'disengaged'));
            RAISE NOTICE 'Added status column to permanent_matches table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'permanent_matches' AND column_name = 'male_accepted') THEN
            ALTER TABLE permanent_matches ADD COLUMN male_accepted boolean DEFAULT false;
            RAISE NOTICE 'Added male_accepted column to permanent_matches table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'permanent_matches' AND column_name = 'female_accepted') THEN
            ALTER TABLE permanent_matches ADD COLUMN female_accepted boolean DEFAULT false;
            RAISE NOTICE 'Added female_accepted column to permanent_matches table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'permanent_matches' AND column_name = 'is_active') THEN
            ALTER TABLE permanent_matches ADD COLUMN is_active boolean DEFAULT true;
            RAISE NOTICE 'Added is_active column to permanent_matches table';
        END IF;
    END IF;
END $$;

-- Set admin user
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

SELECT 'Database status columns added successfully!' as result;
