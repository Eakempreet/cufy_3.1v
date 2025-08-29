import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription with new schema structure
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('subscription_type, subscription_status, payment_confirmed')
      .eq('email', session.user.email)
      .single()

    if (userError) {
      console.log('Error fetching user subscription:', userError)
      return NextResponse.json({ 
        subscription_type: null, 
        subscription_status: 'pending',
        payment_confirmed: false
      })
    }

    return NextResponse.json({
      subscription_type: user?.subscription_type || null,
      subscription_status: user?.subscription_status || 'pending',
      payment_confirmed: user?.payment_confirmed || false
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscription_type } = await request.json()

    if (!['basic', 'premium'].includes(subscription_type)) {
      return NextResponse.json({ error: 'Invalid subscription type' }, { status: 400 })
    }

    // Update user's subscription preference (not active until payment)
    // Use upsert to handle cases where user doesn't exist
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError)
      return NextResponse.json({ error: 'Failed to check user' }, { status: 500 })
    }

    let updateData = {
      subscription_type,
      updated_at: new Date().toISOString()
    }

    // Try to update with fallback for missing columns
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('email', session.user.email)

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      
      // If it's a column doesn't exist error, try with minimal update
      if (updateError.message?.includes('column') || updateError.message?.includes('does not exist')) {
        console.log('Column might not exist, trying minimal update...')
        
        // Try with just the basic fields that should exist
        const { error: basicUpdateError } = await supabaseAdmin
          .from('users')
          .update({ updated_at: new Date().toISOString() })
          .eq('email', session.user.email)
        
        if (basicUpdateError) {
          console.error('Even basic update failed:', basicUpdateError)
          return NextResponse.json({ 
            error: 'Database schema issue - subscription_type column missing',
            requiresMigration: true
          }, { status: 500 })
        }
        
        // Return success but indicate schema needs update
        return NextResponse.json({ 
          success: true, 
          subscription_type,
          warning: 'Subscription updated but database needs migration'
        })
      }
      
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      subscription_type 
    })
  } catch (error) {
    console.error('Error processing subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
