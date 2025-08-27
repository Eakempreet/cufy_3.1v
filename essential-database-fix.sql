-- Simple database fix - only add essential missing columns
-- Copy and paste this into your Supabase SQL Editor

-- 1. Check if profile_assignments table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_assignments') THEN
        CREATE TABLE profile_assignments (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            male_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            female_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(male_user_id, female_user_id)
        );
        RAISE NOTICE 'Created profile_assignments table';
    ELSE
        RAISE NOTICE 'profile_assignments table already exists';
    END IF;
END $$;

-- 2. Check if temporary_matches table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'temporary_matches') THEN
        CREATE TABLE temporary_matches (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            male_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            female_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            expires_at timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '48 hours') NOT NULL,
            UNIQUE(male_user_id, female_user_id)
        );
        RAISE NOTICE 'Created temporary_matches table';
    ELSE
        RAISE NOTICE 'temporary_matches table already exists';
    END IF;
END $$;

-- 3. Check if permanent_matches table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permanent_matches') THEN
        CREATE TABLE permanent_matches (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            male_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            female_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(male_user_id, female_user_id)
        );
        RAISE NOTICE 'Created permanent_matches table';
    ELSE
        RAISE NOTICE 'permanent_matches table already exists';
    END IF;
END $$;

-- 4. Add is_admin column to users if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin boolean DEFAULT false;
        RAISE NOTICE 'Added is_admin column to users table';
    ELSE
        RAISE NOTICE 'is_admin column already exists in users table';
    END IF;
END $$;

-- 5. Create admin user
INSERT INTO users (email, full_name, gender, is_admin,
                  phone_number, age, university, year_of_study, bio, 
                  energy_style, group_setting, ideal_weekend, communication_style, 
                  best_trait, relationship_values, love_language, connection_statement) 
VALUES ('cufy.online@gmail.com', 'Admin User', 'male', true,
        '+1234567890', 25, 'Admin University', 'Graduate', 'Admin bio',
        'High energy', 'Large groups', ARRAY['Working'], 'Direct',
        'Leadership', ARRAY['Trust'], 'Words of affirmation', 'Admin connection')
ON CONFLICT (email) 
DO UPDATE SET 
    is_admin = true,
    updated_at = timezone('utc'::text, now());

SELECT 'Essential database setup completed successfully!' as result;
