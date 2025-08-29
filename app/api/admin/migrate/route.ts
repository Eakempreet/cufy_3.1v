import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // This is a migration endpoint for database setup
    const { action } = await request.json()
    
    if (action === 'migrate') {
      console.log('Starting database migration...')
      
      // Check if users table exists and has required columns
      const { data: usersTableInfo, error: usersError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'users')
        .eq('table_schema', 'public')
      
      const existingColumns = usersTableInfo?.map(col => col.column_name) || []
      console.log('Existing columns in users table:', existingColumns)
      
      // Add missing columns one by one
      const requiredColumns = [
        'instagram',
        'subscription_type', 
        'subscription_status',
        'subscription_expiry',
        'payment_confirmed',
        'rounds_used',
        'is_onboarded'
      ]
      
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
      console.log('Missing columns:', missingColumns)
      
      // For each missing column, add it
      for (const column of missingColumns) {
        let sql = ''
        switch (column) {
          case 'instagram':
            sql = 'ALTER TABLE users ADD COLUMN instagram VARCHAR(255)'
            break
          case 'subscription_type':
            sql = "ALTER TABLE users ADD COLUMN subscription_type VARCHAR(20) CHECK (subscription_type IN ('basic', 'premium'))"
            break
          case 'subscription_status':
            sql = "ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'expired'))"
            break
          case 'subscription_expiry':
            sql = 'ALTER TABLE users ADD COLUMN subscription_expiry TIMESTAMPTZ'
            break
          case 'payment_confirmed':
            sql = 'ALTER TABLE users ADD COLUMN payment_confirmed BOOLEAN DEFAULT FALSE'
            break
          case 'rounds_used':
            sql = 'ALTER TABLE users ADD COLUMN rounds_used INTEGER DEFAULT 0'
            break
          case 'is_onboarded':
            sql = 'ALTER TABLE users ADD COLUMN is_onboarded BOOLEAN DEFAULT FALSE'
            break
        }
        
        if (sql) {
          try {
            const { error } = await supabaseAdmin.rpc('exec_sql', { sql })
            if (error) {
              console.log(`Column ${column} might already exist or has constraint issues:`, error.message)
            } else {
              console.log(`Added column: ${column}`)
            }
          } catch (err) {
            console.log(`Error adding column ${column}:`, err)
          }
        }
      }
      
      // Check if subscriptions table exists
      const { data: subscriptionsTable, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('id')
        .limit(1)
      
      if (subError && subError.code === 'PGRST116') {
        // Table doesn't exist, create it
        console.log('Creating subscriptions table...')
        const createSubscriptionsSQL = `
          CREATE TABLE subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'premium')),
            price DECIMAL(10,2) NOT NULL,
            duration_days INTEGER NOT NULL,
            features JSONB,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          )
        `
        
        try {
          await supabaseAdmin.rpc('exec_sql', { sql: createSubscriptionsSQL })
          console.log('Created subscriptions table')
          
          // Insert default plans
          const insertPlansSQL = `
            INSERT INTO subscriptions (name, type, price, duration_days, features) VALUES
            ('Basic Plan', 'basic', 99.00, 30, '{"profiles_per_round": 1, "max_rounds": 2, "support": "email", "choice": false}'),
            ('Premium Plan', 'premium', 249.00, 30, '{"profiles_per_round": 3, "max_rounds": 2, "support": "priority", "advanced_filters": true, "choice": true}')
          `
          await supabaseAdmin.rpc('exec_sql', { sql: insertPlansSQL })
          console.log('Inserted default subscription plans')
        } catch (err) {
          console.log('Error creating subscriptions table:', err)
        }
      }
      
      // Check if payments table exists
      const { data: paymentsTable, error: payError } = await supabaseAdmin
        .from('payments')
        .select('id')
        .limit(1)
      
      if (payError && payError.code === 'PGRST116') {
        console.log('Creating payments table...')
        const createPaymentsSQL = `
          CREATE TABLE payments (
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
          )
        `
        
        try {
          await supabaseAdmin.rpc('exec_sql', { sql: createPaymentsSQL })
          console.log('Created payments table')
        } catch (err) {
          console.log('Error creating payments table:', err)
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database migration completed',
        existingColumns,
        missingColumns
      })
    }
    
    if (action === 'check') {
      // Just check the database state
      const { data: usersCount } = await supabaseAdmin
        .from('users')
        .select('id', { count: 'exact' })
      
      const { data: subscriptionsCount } = await supabaseAdmin
        .from('subscriptions')
        .select('id', { count: 'exact' })
      
      const { data: paymentsCount } = await supabaseAdmin
        .from('payments')
        .select('id', { count: 'exact' })
      
      return NextResponse.json({
        users: usersCount?.length || 0,
        subscriptions: subscriptionsCount?.length || 0,
        payments: paymentsCount?.length || 0
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check database connection and basic info
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, subscription_type, payment_confirmed')
      .limit(5)
    
    if (error) {
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      sampleUsers: users,
      message: 'Database connection successful'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Database error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
