import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { subscription_type } = await request.json()

    if (!subscription_type || !['basic', 'premium'].includes(subscription_type)) {
      return NextResponse.json(
        { error: 'Invalid subscription type' },
        { status: 400 }
      )
    }

    // Update user's subscription type
    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_type,
        subscription_status: 'pending',
        payment_confirmed: false,
        updated_at: new Date().toISOString()
      })
      .eq('email', session.user.email)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Subscription type updated successfully',
      user: data?.[0] 
    })
  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
