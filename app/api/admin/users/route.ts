import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get all users from the users table
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Users fetch error:', error)
      return NextResponse.json({ users: [] })
    }

    // Format the data to match expected structure
    const formattedUsers = (users || []).map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      age: user.age,
      gender: user.gender,
      university: user.university,
      profile_photo: user.profile_photo,
      bio: user.bio,
      created_at: user.created_at,
      subscription_type: user.subscription_type || null,
      subscription_status: user.subscription_status || 'pending',
      payment_confirmed: user.payment_confirmed || false
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json({ users: [] })
  }
}
