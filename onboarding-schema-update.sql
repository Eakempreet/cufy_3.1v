-- Comprehensive schema update for onboarding fields
-- This adds all missing columns needed for the boys/girls onboarding

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS university VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS year_of_study VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS energy_style VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS group_setting VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS ideal_weekend VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS communication_style VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_trait VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS relationship_values VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS love_language VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS connection_statement TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Update existing name column to be consistent with full_name
UPDATE users SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;

-- Update existing photo_url to be consistent with profile_photo  
UPDATE users SET profile_photo = photo_url WHERE profile_photo IS NULL AND photo_url IS NOT NULL;
