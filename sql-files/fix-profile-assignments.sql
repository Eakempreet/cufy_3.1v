-- Migration to fix profile_assignments table columns
-- Add missing columns if they don't exist

-- Add male_revealed column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profile_assignments' 
        AND column_name = 'male_revealed'
    ) THEN
        ALTER TABLE profile_assignments 
        ADD COLUMN male_revealed boolean DEFAULT false;
    END IF;
END $$;

-- Add female_revealed column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profile_assignments' 
        AND column_name = 'female_revealed'
    ) THEN
        ALTER TABLE profile_assignments 
        ADD COLUMN female_revealed boolean DEFAULT false;
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profile_assignments' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE profile_assignments 
        ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disengaged'));
    END IF;
END $$;

-- Add created_at column if it doesn't exist (rename from assigned_at)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profile_assignments' 
        AND column_name = 'created_at'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profile_assignments' 
            AND column_name = 'assigned_at'
        ) THEN
            ALTER TABLE profile_assignments 
            RENAME COLUMN assigned_at TO created_at;
        ELSE
            ALTER TABLE profile_assignments 
            ADD COLUMN created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
        END IF;
    END IF;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profile_assignments_male ON profile_assignments(male_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_female ON profile_assignments(female_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_assignments_status ON profile_assignments(status);

-- Update the permanent_matches table to have the correct structure
-- Add male_accepted and female_accepted columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'permanent_matches' 
        AND column_name = 'male_accepted'
    ) THEN
        ALTER TABLE permanent_matches 
        ADD COLUMN male_accepted boolean DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'permanent_matches' 
        AND column_name = 'female_accepted'
    ) THEN
        ALTER TABLE permanent_matches 
        ADD COLUMN female_accepted boolean DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'permanent_matches' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE permanent_matches 
        ADD COLUMN is_active boolean DEFAULT true;
    END IF;
END $$;

-- Remove old columns if they exist
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'permanent_matches' 
        AND column_name = 'male_disengaged'
    ) THEN
        ALTER TABLE permanent_matches 
        DROP COLUMN male_disengaged;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'permanent_matches' 
        AND column_name = 'female_disengaged'
    ) THEN
        ALTER TABLE permanent_matches 
        DROP COLUMN female_disengaged;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'permanent_matches' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE permanent_matches 
        DROP COLUMN status;
    END IF;
END $$;

SELECT 'Migration completed successfully!' as result;
