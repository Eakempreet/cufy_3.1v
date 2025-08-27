import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: assignments, error } = await supabase
      .from('profile_assignments')
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
        { error: 'Failed to fetch assignments' },
        { status: 500 }
      )
    }

    // Add default values for fields that don't exist in the database yet
    const assignmentsWithDefaults = (assignments || []).map(assignment => ({
      ...assignment,
      status: 'active', // Default status until database is updated
      male_revealed: false, // Default until database is updated
      female_revealed: false // Default until database is updated
    }))

    return NextResponse.json({ assignments: assignmentsWithDefaults })
  } catch (error) {
    console.error('Assignments fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
