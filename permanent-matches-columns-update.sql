-- Add missing columns to permanent_matches table for admin panel functionality
-- These columns are expected by the AdminPanel component

DO $$ 
BEGIN
    -- Add male_accepted column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permanent_matches' AND column_name = 'male_accepted') THEN
        ALTER TABLE permanent_matches ADD COLUMN male_accepted BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added male_accepted column to permanent_matches table';
    END IF;
    
    -- Add female_accepted column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permanent_matches' AND column_name = 'female_accepted') THEN
        ALTER TABLE permanent_matches ADD COLUMN female_accepted BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added female_accepted column to permanent_matches table';
    END IF;
    
    -- Add is_active column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permanent_matches' AND column_name = 'is_active') THEN
        ALTER TABLE permanent_matches ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_active column to permanent_matches table';
    END IF;
    
    -- Add rounds_count column to users table for payment tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'rounds_count') THEN
        ALTER TABLE users ADD COLUMN rounds_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added rounds_count column to users table';
    END IF;
END $$;

SELECT 'Permanent matches table update complete!' as status;
