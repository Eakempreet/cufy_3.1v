import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user
    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('id, email, gender')
      .eq('email', session.user.email)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let assignments = []
    let tempMatches = []

    if (currentUser.gender === 'male') {
      // Get assignments for male users (exclude disengaged)
      const { data: maleAssignments, error: assignmentsError } = await supabaseAdmin
        .from('profile_assignments')
        .select('*')
        .eq('male_user_id', currentUser.id)
        .neq('status', 'disengaged') // Exclude disengaged assignments
        .order('assigned_at', { ascending: false })

      if (assignmentsError) {
        console.error('Male assignments fetch error:', assignmentsError)
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
      }

      assignments = maleAssignments || []
    }

    // Get female profiles for these assignments
    const assignments_with_profiles = await Promise.all(
      assignments.map(async (assignment) => {
        const { data: femaleProfile } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', assignment.female_user_id)
          .single()

        return {
          ...assignment,
          female_user: femaleProfile
        }
      })
    )

    // Get temporary matches for the current user
    const { data: userTempMatches, error: tempMatchesError } = await supabaseAdmin
      .from('temporary_matches')
      .select('*')
      .or(`male_user_id.eq.${currentUser.id},female_user_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false })

    if (tempMatchesError) {
      console.error('Temp matches fetch error:', tempMatchesError)
    }

    tempMatches = userTempMatches || []

    // Get profiles for temp matches
    const temp_matches_with_profiles = tempMatches && tempMatches.length > 0 ? await Promise.all(
      tempMatches.map(async (match) => {
        const isCurrentUserMale = match.male_user_id === currentUser.id
        const profileId = isCurrentUserMale ? match.female_user_id : match.male_user_id
        
        const { data: profile } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', profileId)
          .single()
        
        return {
          ...match,
          female_user: isCurrentUserMale ? profile : null,
          male_user: !isCurrentUserMale ? profile : null
        }
      })
    ) : []

    return NextResponse.json({
      assignments: assignments_with_profiles,
      temporary_matches: temp_matches_with_profiles
    })
  } catch (error) {
    console.error('Get assignments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
