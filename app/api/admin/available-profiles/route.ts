import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { maleUserId } = await request.json()

    if (!maleUserId) {
      return NextResponse.json(
        { error: 'Male user ID is required' },
        { status: 400 }
      )
    }

    // Get female users who are not already assigned to this male user
    // First get the assigned female user IDs for this male user
    const { data: assignedUsers, error: assignmentError } = await supabase
      .from('profile_assignments')
      .select('female_user_id')
      .eq('male_user_id', maleUserId)

    if (assignmentError) {
      console.error('Assignment fetch error:', assignmentError)
      return NextResponse.json(
        { error: 'Failed to fetch assignments' },
        { status: 500 }
      )
    }

    const assignedUserIds = (assignedUsers || []).map(a => a.female_user_id)

    // Get all female users
    const { data: allProfiles, error } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        age,
        university,
        profile_photo,
        bio
      `)
      .eq('gender', 'female')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch available profiles' },
        { status: 500 }
      )
    }

    // Filter out already assigned users
    const profiles = (allProfiles || []).filter(profile => 
      !assignedUserIds.includes(profile.id)
    )

    // Filter out users who already have 2+ active assignments
    const filteredProfiles = []
    
    for (const profile of profiles) {
      const { count } = await supabase
        .from('profile_assignments')
        .select('id', { count: 'exact' })
        .eq('female_user_id', profile.id)

      if ((count || 0) < 2) {
        filteredProfiles.push(profile)
      }
    }

    return NextResponse.json({ profiles: filteredProfiles })
  } catch (error) {
    console.error('Available profiles fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
