import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== 'cufy.online@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'confirm') {
      // Confirm payment for user
      const { error } = await supabaseAdmin
        .from('users')
        .update({ 
          payment_confirmed: true,
          subscription_status: 'active'
        })
        .eq('id', userId)

      if (error) {
        console.error('Error confirming payment:', error)
        return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Payment confirmed successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in payments API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== 'cufy.online@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get male users with payment info using admin client for RLS bypass
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        full_name,
        age,
        gender,
        university,
        profile_photo,
        bio,
        created_at,
        subscription_type,
        subscription_status,
        payment_confirmed,
        payment_proof_url
      `)
      .eq('gender', 'male')
      .not('subscription_type', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch users error:', error)
      return NextResponse.json({ 
        users: [],
        error: error.message 
      })
    }

    console.log(`Found ${users?.length || 0} male users with subscriptions`)

    // Also get payment records for additional info
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.warn('Failed to fetch payment records:', paymentsError)
    }

    // Format the data to match expected structure
    const usersWithPaymentInfo = (users || []).map(user => {
      // Find corresponding payment record
      const userPayment = payments?.find(p => p.user_id === user.id)
      
      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        age: user.age,
        gender: user.gender,
        university: user.university,
        profile_photo: user.profile_photo,
        bio: user.bio,
        created_at: user.created_at,
        subscription_type: user.subscription_type,
        subscription_status: user.subscription_status || 'pending',
        payment_confirmed: user.payment_confirmed || false,
        payment_proof_url: user.payment_proof_url,
        payment_record: userPayment,
        rounds_count: 0 // Default value - can be calculated later if needed
      }
    })

    console.log(`Returning ${usersWithPaymentInfo.length} users with payment info`)
    console.log('Sample payment proofs:', usersWithPaymentInfo.slice(0, 3).map(u => ({ 
      id: u.id, 
      name: u.full_name, 
      proof_url: u.payment_proof_url 
    })))

    return NextResponse.json({ 
      users: usersWithPaymentInfo,
      total: usersWithPaymentInfo.length,
      success: true 
    })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json({ 
      users: [],
      error: 'Internal server error',
      success: false 
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== 'cufy.online@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'confirm') {
      // Confirm payment
      const { error } = await supabaseAdmin
        .from('users')
        .update({ 
          payment_confirmed: true,
          subscription_status: 'active'
        })
        .eq('id', userId)

      if (error) {
        console.error('Error confirming payment:', error)
        return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Payment confirmed successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in payments API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
