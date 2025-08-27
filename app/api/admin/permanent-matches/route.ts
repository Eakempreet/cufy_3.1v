import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
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
          profile_photo
        ),
        female_user:female_user_id (
          id,
          full_name,
          age,
          university,
          profile_photo
        )
      `)
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
      male_accepted: false, // Default until database is updated
      female_accepted: false, // Default until database is updated
      is_active: true, // Default until database is updated
      male_disengaged: false, // Default until database is updated
      female_disengaged: false // Default until database is updated
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
