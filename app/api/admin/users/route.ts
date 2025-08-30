import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching users from admin API...')
    
    // Get total count first
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Count fetch error:', countError)
    } else {
      console.log(`Total users in database: ${totalCount}`)
    }

    // Get all users from the users table with explicit range to avoid limits
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .range(0, 1000) // Explicitly set range for first 1000 users
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Users fetch error:', error)
      return NextResponse.json({ users: [], total: 0, error: error.message })
    }

    console.log(`Fetched ${(users || []).length} users from database`)

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
      payment_confirmed: user.payment_confirmed || false,
      payment_proof_url: user.payment_proof_url || null,
      rounds_count: user.rounds_used || 0,
      phone_number: user.phone_number || null,
      year_of_study: user.year_of_study || null,
      energy_style: user.energy_style || null,
      group_setting: user.group_setting || null,
      ideal_weekend: user.ideal_weekend || null,
      communication_style: user.communication_style || null,
      best_trait: user.best_trait || null,
      relationship_values: user.relationship_values || null,
      love_language: user.love_language || null,
      connection_statement: user.connection_statement || null,
      instagram: user.instagram || null
    }))

    return NextResponse.json({ 
      users: formattedUsers, 
      total: totalCount || formattedUsers.length,
      fetched: formattedUsers.length 
    })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json({ 
      users: [], 
      total: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}
