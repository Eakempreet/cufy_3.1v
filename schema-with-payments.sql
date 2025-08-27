-- Enhanced schema with subscription and payment features
-- This builds on the existing schema

-- Add subscription and payment related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) CHECK (subscription_type IN ('basic', 'premium'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rounds_used INTEGER DEFAULT 0;

-- Create subscriptions table to track subscription plans
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

-- Create payments table to track payment records
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

-- Create user_rounds table to track how many times a user has been selected
CREATE TABLE IF NOT EXISTS user_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    selected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscriptions (name, type, price, duration_days, features) VALUES
('Basic Plan', 'basic', 499.00, 30, '{"profiles_per_round": 3, "max_rounds": 5, "support": "email"}'),
('Premium Plan', 'premium', 999.00, 30, '{"profiles_per_round": 5, "max_rounds": 10, "support": "priority", "advanced_filters": true}')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_user_rounds_user_id ON user_rounds(user_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
