import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: matches, error } = await supabase
      .from('temporary_matches')
      .select(`
        id,
        created_at,
        expires_at,
        male_disengaged,
        female_disengaged,
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
        { error: 'Failed to fetch temporary matches' },
        { status: 500 }
      )
    }

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Temporary matches fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
