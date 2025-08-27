-- Test schema to add missing columns to existing tables
-- This will add the missing columns without dropping existing data

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
    -- Add subscription_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_type') THEN
        ALTER TABLE users ADD COLUMN subscription_type VARCHAR(50);
    END IF;
    
    -- Add subscription_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
        ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'inactive';
    END IF;
    
    -- Add payment_confirmed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'payment_confirmed') THEN
        ALTER TABLE users ADD COLUMN payment_confirmed BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add payment_proof_url column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'payment_proof_url') THEN
        ALTER TABLE users ADD COLUMN payment_proof_url TEXT;
    END IF;
END $$;

-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
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

-- Create user_rounds table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    selected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rounds_user ON user_rounds(user_id);
