-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS user_rounds CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS temporary_matches CASCADE;
DROP TABLE IF EXISTS permanent_matches CASCADE;
DROP TABLE IF EXISTS profile_assignments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female')),
    age INTEGER,
    education VARCHAR(255),
    location VARCHAR(255),
    bio TEXT,
    hobbies TEXT[],
    looking_for VARCHAR(20) CHECK (looking_for IN ('male', 'female')),
    photo_url TEXT,
    subscription_type VARCHAR(50),
    subscription_status VARCHAR(50) DEFAULT 'inactive',
    payment_confirmed BOOLEAN DEFAULT FALSE,
    payment_proof_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT FALSE
);

-- Create profile_assignments table
CREATE TABLE profile_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    male_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    female_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    male_viewed BOOLEAN DEFAULT FALSE,
    female_viewed BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'matched'))
);

-- Create temporary_matches table
CREATE TABLE temporary_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    male_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    female_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    male_disengaged BOOLEAN DEFAULT FALSE,
    female_disengaged BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create permanent_matches table
CREATE TABLE permanent_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    male_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    female_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    male_accepted BOOLEAN DEFAULT FALSE,
    female_accepted BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    subscription_type VARCHAR(50) NOT NULL,
    payment_proof_url TEXT,
    confirmed_at TIMESTAMPTZ,
    confirmed_by VARCHAR(255),
    rejected_at TIMESTAMPTZ,
    rejected_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_rounds table to track user selections
CREATE TABLE user_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    selected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_profile_assignments_male_user ON profile_assignments(male_user_id);
CREATE INDEX idx_profile_assignments_female_user ON profile_assignments(female_user_id);
CREATE INDEX idx_temporary_matches_users ON temporary_matches(male_user_id, female_user_id);
CREATE INDEX idx_permanent_matches_users ON permanent_matches(male_user_id, female_user_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_user_rounds_user ON user_rounds(user_id);

-- Insert admin user (if not exists)
INSERT INTO users (email, name, gender, is_admin, created_at)
VALUES ('cufy.online@gmail.com', 'Admin User', 'male', TRUE, NOW())
ON CONFLICT (email) DO UPDATE SET 
    is_admin = TRUE,
    updated_at = NOW();

-- Create or replace function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile-photos', 'profile-photos', true),
  ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile photos
CREATE POLICY "Profile photos are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own profile photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-photos');

-- Create storage policies for payment proofs
CREATE POLICY "Payment proofs accessible to authenticated users" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload payment proofs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update payment proofs" ON storage.objects
FOR UPDATE USING (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');
