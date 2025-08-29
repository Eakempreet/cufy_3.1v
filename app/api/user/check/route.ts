import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get all fields, but handle gracefully if some columns don't exist
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        full_name,
        age,
        gender,
        university,
        bio,
        profile_photo,
        created_at
      `)
      .eq('email', session.user.email)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // If user exists, try to get subscription info separately
    let subscriptionData = null
    if (data) {
      try {
        const { data: subData } = await supabaseAdmin
          .from('users')
          .select('subscription_type, payment_confirmed')
          .eq('email', session.user.email)
          .single()
        
        subscriptionData = subData
      } catch (subError) {
        console.log('Subscription columns might not exist:', subError)
        // This is okay, subscription columns might not exist yet
      }
    }

    const userData = data ? {
      ...data,
      subscription_type: subscriptionData?.subscription_type || null,
      payment_confirmed: subscriptionData?.payment_confirmed || false
    } : null

    return NextResponse.json({ 
      exists: !!data,
      user: userData
    })
  } catch (error) {
    console.error('Check user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ exists: !!data })
  } catch (error) {
    console.error('Check user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
