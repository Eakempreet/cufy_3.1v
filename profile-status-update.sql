-- Add missing profile_status column to users table
-- This column is needed for the admin panel assignment functionality

DO $$ 
BEGIN
    -- Add profile_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_status') THEN
        ALTER TABLE users ADD COLUMN profile_status VARCHAR(20) DEFAULT 'active' CHECK (profile_status IN ('active', 'inactive', 'pending'));
        
        -- Update existing users to have active profile status
        UPDATE users SET profile_status = 'active' WHERE profile_status IS NULL;
        
        RAISE NOTICE 'Added profile_status column to users table';
    ELSE
        RAISE NOTICE 'profile_status column already exists';
    END IF;
END $$;

-- Create index for profile_status for better query performance
CREATE INDEX IF NOT EXISTS idx_users_profile_status ON users(profile_status);

SELECT 'Profile status column update complete!' as status;
