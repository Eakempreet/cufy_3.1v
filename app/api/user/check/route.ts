import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        age,
        gender,
        education,
        bio,
        photo_url,
        subscription_type,
        subscription_status,
        payment_confirmed,
        payment_proof_url,
        created_at
      `)
      .eq('email', session.user.email)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ 
      exists: !!data,
      user: data || null
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

    const { data, error } = await supabase
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
