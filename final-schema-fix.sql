-- CUFY 3.1v Database Fix - Essential Schema Updates
-- Run this script to fix the current database schema issues

-- 1. First, update the users table to match what our code expects
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS university VARCHAR(255),
ADD COLUMN IF NOT EXISTS year_of_study VARCHAR(50),
ADD COLUMN IF NOT EXISTS profile_photo TEXT,
ADD COLUMN IF NOT EXISTS energy_style VARCHAR(100),
ADD COLUMN IF NOT EXISTS group_setting VARCHAR(100),
ADD COLUMN IF NOT EXISTS ideal_weekend TEXT[],
ADD COLUMN IF NOT EXISTS communication_style VARCHAR(100),
ADD COLUMN IF NOT EXISTS best_trait VARCHAR(100),
ADD COLUMN IF NOT EXISTS relationship_values TEXT[],
ADD COLUMN IF NOT EXISTS love_language VARCHAR(100),
ADD COLUMN IF NOT EXISTS connection_statement TEXT;

-- 2. Update existing name column to full_name if needed
UPDATE users SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;

-- 3. Fix the gender column constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_gender_check;
ALTER TABLE users ADD CONSTRAINT users_gender_check CHECK (gender IN ('male', 'female'));

-- 4. Remove columns that we don't use anymore (if they exist)
ALTER TABLE profile_assignments DROP COLUMN IF EXISTS male_viewed;
ALTER TABLE profile_assignments DROP COLUMN IF EXISTS female_viewed;
ALTER TABLE profile_assignments DROP COLUMN IF EXISTS status;

ALTER TABLE temporary_matches DROP COLUMN IF EXISTS male_disengaged;
ALTER TABLE temporary_matches DROP COLUMN IF EXISTS female_disengaged;

ALTER TABLE permanent_matches DROP COLUMN IF EXISTS male_accepted;
ALTER TABLE permanent_matches DROP COLUMN IF EXISTS female_accepted;
ALTER TABLE permanent_matches DROP COLUMN IF EXISTS is_active;

-- 5. Clean up expired temporary matches
DELETE FROM temporary_matches WHERE expires_at < NOW();

-- 6. Create a simple view for admin panel to get user data easily
CREATE OR REPLACE VIEW admin_user_view AS
SELECT 
    u.id,
    u.email,
    COALESCE(u.full_name, u.name) as full_name,
    u.gender,
    u.age,
    u.university,
    u.year_of_study,
    u.profile_photo,
    u.bio,
    u.created_at,
    u.is_admin
FROM users u
ORDER BY u.created_at DESC;

-- 7. Create a simple view for assignments that shows all user data
CREATE OR REPLACE VIEW assignment_view AS
SELECT 
    pa.id as assignment_id,
    pa.male_user_id,
    pa.female_user_id,
    pa.created_at as assigned_at,
    mu.full_name as male_name,
    mu.email as male_email,
    mu.age as male_age,
    mu.university as male_university,
    mu.profile_photo as male_photo,
    fu.full_name as female_name,
    fu.email as female_email,
    fu.age as female_age,
    fu.university as female_university,
    fu.profile_photo as female_photo
FROM profile_assignments pa
JOIN users mu ON pa.male_user_id = mu.id
JOIN users fu ON pa.female_user_id = fu.id
ORDER BY pa.created_at DESC;

-- 8. Ensure admin user exists
INSERT INTO users (
    email, 
    full_name, 
    gender, 
    is_admin,
    age,
    university,
    bio,
    created_at
) 
VALUES (
    'cufy.online@gmail.com', 
    'Admin User', 
    'male', 
    true,
    25,
    'Admin University',
    'Admin user for CUFY platform',
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    is_admin = true,
    updated_at = NOW();

SELECT 'Database schema updated successfully! All issues should now be resolved.' as result;
