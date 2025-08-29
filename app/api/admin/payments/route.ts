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

    // Get male users with payment info
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('gender', 'male')
      .not('subscription_type', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch users error:', error)
      return NextResponse.json({ users: [] })
    }

    // Format the data to match expected structure
    const usersWithPaymentInfo = (users || []).map(user => ({
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
      rounds_count: 0 // Default value - can be calculated later if needed
    }))

    return NextResponse.json({ users: usersWithPaymentInfo })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json({ users: [] })
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
