import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from email
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: matches, error } = await supabase
      .from('permanent_matches')
      .select(`
        id,
        created_at,
        male_user:male_user_id (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio
        ),
        female_user:female_user_id (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio
        )
      `)
      .or(`male_user_id.eq.${user.id},female_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch permanent matches' },
        { status: 500 }
      )
    }

    // Add default values for fields that don't exist in the database yet
    const matchesWithDefaults = (matches || []).map(match => ({
      ...match,
      status: 'active', // Default status
      matched_at: match.created_at // Use created_at as matched_at
    }))

    return NextResponse.json({ matches: matchesWithDefaults })
  } catch (error) {
    console.error('Permanent matches fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
