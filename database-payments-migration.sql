-- Comprehensive database migration for payments and subscriptions
-- This script ensures all required tables and columns exist

-- First, ensure users table exists with all required columns
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    age INTEGER,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    university VARCHAR(255),
    bio TEXT,
    profile_photo TEXT,
    instagram VARCHAR(255),
    subscription_type VARCHAR(20) CHECK (subscription_type IN ('basic', 'premium')),
    subscription_status VARCHAR(20) DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired')),
    subscription_expiry TIMESTAMPTZ,
    payment_confirmed BOOLEAN DEFAULT FALSE,
    rounds_used INTEGER DEFAULT 0,
    is_onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) CHECK (subscription_type IN ('basic', 'premium'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rounds_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

-- Create subscriptions table for subscription plans
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'premium')),
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table for payment tracking
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'qr_code',
    payment_proof_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    transaction_id VARCHAR(100),
    admin_notes TEXT,
    confirmed_by UUID REFERENCES users(id),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create other required tables if they don't exist
CREATE TABLE IF NOT EXISTS temporary_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boys_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    girls_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_boys_revealed BOOLEAN DEFAULT FALSE,
    is_girls_revealed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permanent_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boys_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    girls_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    revealed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boys_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    girls_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'revealed', 'disengaged')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscriptions (name, type, price, duration_days, features) VALUES
('Basic Plan', 'basic', 99.00, 30, '{"profiles_per_round": 1, "max_rounds": 2, "support": "email", "choice": false}'),
('Premium Plan', 'premium', 249.00, 30, '{"profiles_per_round": 3, "max_rounds": 2, "support": "priority", "advanced_filters": true, "choice": true}')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_temporary_matches_boys_id ON temporary_matches(boys_id);
CREATE INDEX IF NOT EXISTS idx_temporary_matches_girls_id ON temporary_matches(girls_id);
CREATE INDEX IF NOT EXISTS idx_permanent_matches_boys_id ON permanent_matches(boys_id);
CREATE INDEX IF NOT EXISTS idx_permanent_matches_girls_id ON permanent_matches(girls_id);
CREATE INDEX IF NOT EXISTS idx_assignments_boys_id ON assignments(boys_id);
CREATE INDEX IF NOT EXISTS idx_assignments_girls_id ON assignments(girls_id);

-- Create or replace function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_temporary_matches_updated_at ON temporary_matches;
CREATE TRIGGER update_temporary_matches_updated_at 
    BEFORE UPDATE ON temporary_matches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assignments_updated_at ON assignments;
CREATE TRIGGER update_assignments_updated_at 
    BEFORE UPDATE ON assignments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE permanent_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for other tables
DROP POLICY IF EXISTS "Service role can access subscriptions" ON subscriptions;
CREATE POLICY "Service role can access subscriptions" ON subscriptions
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
CREATE POLICY "Users can insert own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Temporary matches policies
DROP POLICY IF EXISTS "Users can view own matches" ON temporary_matches;
CREATE POLICY "Users can view own matches" ON temporary_matches
    FOR SELECT USING (
        auth.uid()::text = boys_id::text OR 
        auth.uid()::text = girls_id::text
    );

-- Permanent matches policies
DROP POLICY IF EXISTS "Users can view own permanent matches" ON permanent_matches;
CREATE POLICY "Users can view own permanent matches" ON permanent_matches
    FOR SELECT USING (
        auth.uid()::text = boys_id::text OR 
        auth.uid()::text = girls_id::text
    );

-- Assignments policies
DROP POLICY IF EXISTS "Users can view own assignments" ON assignments;
CREATE POLICY "Users can view own assignments" ON assignments
    FOR SELECT USING (
        auth.uid()::text = boys_id::text OR 
        auth.uid()::text = girls_id::text
    );

-- Grant necessary permissions
GRANT ALL ON users TO postgres, anon, authenticated;
GRANT ALL ON subscriptions TO postgres, anon, authenticated;
GRANT ALL ON payments TO postgres, anon, authenticated;
GRANT ALL ON temporary_matches TO postgres, anon, authenticated;
GRANT ALL ON permanent_matches TO postgres, anon, authenticated;
GRANT ALL ON assignments TO postgres, anon, authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;
