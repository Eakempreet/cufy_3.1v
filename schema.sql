-- Cufy Dating Platform Database Schema
-- Run this AFTER running reset.sql

-- Users table with all required fields from onboarding
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    full_name text,
    phone_number text CHECK (length(phone_number) = 10 AND phone_number ~ '^[0-9]+$'),
    age integer CHECK (age >= 18 AND age <= 25),
    university text,
    year_of_study text,
    profile_photo text,
    bio text,
    energy_style text,
    group_setting text,
    ideal_weekend text[],
    communication_style text,
    best_trait text,
    relationship_values text[],
    love_language text,
    connection_statement text,
    gender text CHECK (gender IN ('male', 'female')) NOT NULL,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profile assignments table
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

-- Temporary matches table
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

-- Permanent matches table
CREATE TABLE permanent_matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    temporary_match_id uuid REFERENCES temporary_matches(id) ON DELETE SET NULL,
    male_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    female_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'disengaged')),
    male_disengaged boolean DEFAULT false,
    female_disengaged boolean DEFAULT false,
    UNIQUE(male_user_id, female_user_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_profile_assignments_male ON profile_assignments(male_user_id);
CREATE INDEX idx_profile_assignments_female ON profile_assignments(female_user_id);
CREATE INDEX idx_profile_assignments_status ON profile_assignments(status);
CREATE INDEX idx_temporary_matches_expires ON temporary_matches(expires_at);
CREATE INDEX idx_temporary_matches_status ON temporary_matches(status);

-- Insert admin user
INSERT INTO users (email, full_name, gender, is_admin) 
VALUES ('cufy.online@gmail.com', 'Admin User', 'male', true);

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true);

-- Create storage policies that allow everything for profile-photos bucket
CREATE POLICY "profile_photos_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'profile-photos');

SELECT 'Schema setup complete!' as status;
