import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
    const { data: assignedUsers, error: assignmentError } = await supabaseAdmin
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

    // Get users in permanent matches (these should be excluded from assignment)
    const { data: permanentUsers, error: permError } = await supabaseAdmin
      .from('permanent_matches')
      .select('female_user_id')

    if (permError) {
      console.error('Permanent matches fetch error:', permError)
      return NextResponse.json(
        { error: 'Failed to fetch permanent matches' },
        { status: 500 }
      )
    }

    const permanentUserIds = (permanentUsers || []).map(p => p.female_user_id)

    // Get users in temporary matches (these should be excluded from assignment)
    const { data: tempUsers, error: tempError } = await supabaseAdmin
      .from('temporary_matches')
      .select('female_user_id, male_user_id')
      .eq('male_disengaged', false)
      .eq('female_disengaged', false)

    if (tempError) {
      console.error('Temporary matches fetch error:', tempError)
      return NextResponse.json(
        { error: 'Failed to fetch temporary matches' },
        { status: 500 }
      )
    }

    const tempUserIds = [
      ...(tempUsers || []).map(t => t.female_user_id),
      ...(tempUsers || []).map(t => t.male_user_id)
    ]

    // Get all female users
    const { data: allProfiles, error } = await supabaseAdmin
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

    // Filter out already assigned users, permanent match users, and users in temp matches
    const profiles = (allProfiles || []).filter(profile => 
      !assignedUserIds.includes(profile.id) && 
      !permanentUserIds.includes(profile.id) &&
      !tempUserIds.includes(profile.id)
    )

    // Note: We allow multiple assignments per girl (up to multiple boys)
    // But we'll show the assignment count in the UI for transparency
    const availableProfiles = []
    
    for (const profile of profiles) {
      // Get current assignment count for this profile
      const { data: assignmentCount } = await supabaseAdmin
        .from('profile_assignments')
        .select('id', { count: 'exact' })
        .eq('female_user_id', profile.id)

      // Check if user is in temporary matches
      const { data: tempMatch } = await supabaseAdmin
        .from('temporary_matches')
        .select('id')
        .eq('female_user_id', profile.id)
        .eq('male_disengaged', false)
        .eq('female_disengaged', false)
        .single()

      // Include profile with status information
      availableProfiles.push({
        ...profile,
        assignment_count: assignmentCount?.length || 0,
        in_temp_zone: !!tempMatch
      })
    }

    // Sort by assignment count (lower first) for better UX
    availableProfiles.sort((a, b) => a.assignment_count - b.assignment_count)

    return NextResponse.json({ profiles: availableProfiles })
  } catch (error) {
    console.error('Available profiles fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
