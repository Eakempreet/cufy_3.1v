import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { step } = await request.json()

    switch (step) {
      case 'check-columns':
        return await checkColumns()
      case 'add-payment-columns':
        return await addPaymentColumns()
      case 'add-instagram-column':
        return await addInstagramColumn()
      case 'create-payments-table':
        return await createPaymentsTable()
      default:
        return NextResponse.json({ error: 'Invalid migration step' }, { status: 400 })
    }
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

async function checkColumns() {
  try {
    // Check what columns exist in the users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to check table structure', 
        details: error.message 
      }, { status: 500 })
    }

    const columns = data && data.length > 0 ? Object.keys(data[0]) : []

    return NextResponse.json({
      success: true,
      existingColumns: columns,
      hasSubscriptionType: columns.includes('subscription_type'),
      hasPaymentConfirmed: columns.includes('payment_confirmed'),
      hasInstagram: columns.includes('instagram'),
      sampleData: data?.[0] || null
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check columns', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function addPaymentColumns() {
  try {
    // Try to add subscription_type column
    const { error: error1 } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP DEFAULT NULL;
      `
    })

    if (error1) {
      // If RPC doesn't work, try direct SQL execution
      console.log('RPC failed, trying alternative approach...')
      
      // Alternative: try updating the schema through insert/update operations
      return NextResponse.json({
        success: false,
        error: 'Need manual SQL execution',
        sqlToRun: `
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP DEFAULT NULL,
          ADD COLUMN IF NOT EXISTS payment_confirmed BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP DEFAULT NULL;
        `
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment columns added successfully' 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to add payment columns', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function addInstagramColumn() {
  try {
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);`
    })

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Need manual SQL execution',
        sqlToRun: `ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);`
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Instagram column added successfully' 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to add Instagram column', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function createPaymentsTable() {
  try {
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          subscription_type VARCHAR(20) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'INR',
          payment_method VARCHAR(50),
          payment_status VARCHAR(20) DEFAULT 'pending',
          payment_id VARCHAR(255),
          payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expiry_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_email) REFERENCES users(email)
        );
      `
    })

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Need manual SQL execution',
        sqlToRun: `
          CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            user_email VARCHAR(255) NOT NULL,
            subscription_type VARCHAR(20) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT 'INR',
            payment_method VARCHAR(50),
            payment_status VARCHAR(20) DEFAULT 'pending',
            payment_id VARCHAR(255),
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expiry_date TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES users(email)
          );
        `
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payments table created successfully' 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create payments table', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database Migration API',
    availableSteps: [
      'check-columns',
      'add-payment-columns', 
      'add-instagram-column',
      'create-payments-table'
    ]
  })
}
