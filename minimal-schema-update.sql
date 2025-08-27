-- Quick schema update script for adding missing columns
-- Run this if the database is missing payment-related columns

-- Add columns to users table (safe - won't fail if columns already exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Create payments table (safe - won't fail if table already exists)
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

-- Create user_rounds table (safe - won't fail if table already exists)
CREATE TABLE IF NOT EXISTS user_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    selected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes (safe - won't fail if indexes already exist)
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rounds_user ON user_rounds(user_id);

-- Create storage bucket for payment proofs (safe)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for payment proofs (safe)
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Payment proofs accessible to authenticated users" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update payment proofs" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Payment proofs accessible to authenticated users" ON storage.objects
    FOR SELECT USING (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

    CREATE POLICY "Users can upload payment proofs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');

    CREATE POLICY "Users can update payment proofs" ON storage.objects
    FOR UPDATE USING (bucket_id = 'payment-proofs' AND auth.role() = 'authenticated');
EXCEPTION
    WHEN others THEN
        -- If policies fail, it's likely because they don't exist or there's a permission issue
        -- This is safe to ignore in most cases
        NULL;
END $$;
