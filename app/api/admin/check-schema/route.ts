import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Checking database schema...')
    
    // Test basic connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('Database connection failed:', testError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError.message
      }, { status: 500 })
    }
    
    // Check if subscription columns exist by trying to select them
    let hasSubscriptionColumns = true
    try {
      const { data: subTest, error: subError } = await supabaseAdmin
        .from('users')
        .select('subscription_type, payment_confirmed')
        .limit(1)
      
      if (subError) {
        console.log('Subscription columns test failed:', subError.message)
        if (subError.message.includes('column') && subError.message.includes('does not exist')) {
          hasSubscriptionColumns = false
        }
      }
    } catch (err) {
      console.log('Subscription columns check error:', err)
      hasSubscriptionColumns = false
    }
    
    // Check if subscriptions table exists
    let hasSubscriptionsTable = true
    try {
      const { data: subTableTest, error: subTableError } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .limit(1)
      
      if (subTableError && subTableError.code === 'PGRST116') {
        hasSubscriptionsTable = false
      }
    } catch (err) {
      hasSubscriptionsTable = false
    }
    
    // Check if payments table exists
    let hasPaymentsTable = true
    try {
      const { data: payTableTest, error: payTableError } = await supabaseAdmin
        .from('payments')
        .select('id')
        .limit(1)
      
      if (payTableError && payTableError.code === 'PGRST116') {
        hasPaymentsTable = false
      }
    } catch (err) {
      hasPaymentsTable = false
    }
    
    return NextResponse.json({
      success: true,
      schema: {
        databaseConnected: true,
        hasSubscriptionColumns,
        hasSubscriptionsTable,
        hasPaymentsTable
      },
      needsMigration: !hasSubscriptionColumns || !hasSubscriptionsTable || !hasPaymentsTable
    })
    
  } catch (error) {
    console.error('Schema check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Schema check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('Running database migration...')
    
    // Since we can't run raw SQL easily, let's try a different approach
    // We'll create a simple test to see what's missing and guide the user
    
    const issues = []
    const fixes = []
    
    // Test subscription columns
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .select('subscription_type, payment_confirmed, subscription_status')
        .limit(1)
      
      if (error && error.message.includes('does not exist')) {
        issues.push('Missing subscription columns in users table')
        fixes.push('Need to add: subscription_type, payment_confirmed, subscription_status columns')
      }
    } catch (err) {
      issues.push('Cannot check subscription columns')
    }
    
    // Test subscriptions table
    try {
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .limit(1)
      
      if (error && error.code === 'PGRST116') {
        issues.push('Missing subscriptions table')
        fixes.push('Need to create subscriptions table')
      }
    } catch (err) {
      issues.push('Subscriptions table missing')
      fixes.push('Need to create subscriptions table')
    }
    
    // Test payments table
    try {
      const { error } = await supabaseAdmin
        .from('payments')
        .select('id')
        .limit(1)
      
      if (error && error.code === 'PGRST116') {
        issues.push('Missing payments table')
        fixes.push('Need to create payments table')
      }
    } catch (err) {
      issues.push('Payments table missing')
      fixes.push('Need to create payments table')
    }
    
    return NextResponse.json({
      success: true,
      issues,
      fixes,
      sqlScript: `
-- Run this SQL in your Supabase SQL editor:

-- Add subscription columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) CHECK (subscription_type IN ('basic', 'premium'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ;

-- Create subscriptions table
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

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'qr_code',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscriptions (name, type, price, duration_days, features) VALUES
('Basic Plan', 'basic', 99.00, 30, '{"profiles_per_round": 1, "max_rounds": 2, "support": "email", "choice": false}'),
('Premium Plan', 'premium', 249.00, 30, '{"profiles_per_round": 3, "max_rounds": 2, "support": "priority", "choice": true}')
ON CONFLICT DO NOTHING;
      `
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
