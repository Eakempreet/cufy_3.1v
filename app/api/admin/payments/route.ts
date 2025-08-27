import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email || session.user.email !== 'cufy.online@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { payment_id, action } = await request.json()

    if (!payment_id || !['confirm', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, users(id, email)')
      .eq('id', payment_id)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (action === 'confirm') {
      // Update payment status
      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          confirmed_by: session.user.email
        })
        .eq('id', payment_id)

      if (updatePaymentError) {
        console.error('Update payment error:', updatePaymentError)
        return NextResponse.json(
          { error: 'Failed to confirm payment' },
          { status: 500 }
        )
      }

      // Update user subscription status
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          payment_confirmed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.user_id)

      if (updateUserError) {
        console.error('Update user error:', updateUserError)
        return NextResponse.json(
          { error: 'Failed to update user subscription' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Payment confirmed successfully'
      })
    } else if (action === 'reject') {
      // Update payment status to rejected
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: session.user.email
        })
        .eq('id', payment_id)

      if (updateError) {
        console.error('Update payment error:', updateError)
        return NextResponse.json(
          { error: 'Failed to reject payment' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Payment rejected successfully'
      })
    }

  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email || session.user.email !== 'cufy.online@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get users with payment info (male users with subscriptions)
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        age,
        gender,
        education,
        photo_url,
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
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get rounds count for each user
    const usersWithRounds = await Promise.all(
      (users || []).map(async (user) => {
        const { count } = await supabase
          .from('user_rounds')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        
        return {
          ...user,
          rounds_count: count || 0
        }
      })
    )

    return NextResponse.json({ users: usersWithRounds })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email || session.user.email !== 'cufy.online@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'confirm') {
      // Confirm payment
      const { error } = await supabase
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
