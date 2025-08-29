import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { maleUserId } = await request.json()

    if (!maleUserId) {
      return NextResponse.json({ error: 'Male user ID is required' }, { status: 400 })
    }

    // Get current assignments for this male user
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('profile_assignments')
      .select(`
        id,
        created_at,
        female_user:female_user_id (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio
        )
      `)
      .eq('male_user_id', maleUserId)

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
    }

    // Get assignment counts for each female user
    const assignmentDetails = await Promise.all(
      (assignments || []).map(async (assignment: any) => {
        const { data: countData, error: countError } = await supabaseAdmin
          .from('profile_assignments')
          .select('id', { count: 'exact' })
          .eq('female_user_id', assignment.female_user.id)

        const assignmentCount = countData?.length || 0

        // Check if user is in temporary matches
        const { data: tempMatch } = await supabaseAdmin
          .from('temporary_matches')
          .select('id')
          .eq('female_user_id', assignment.female_user.id)
          .eq('male_disengaged', false)
          .eq('female_disengaged', false)
          .single()

        // Check if user is in permanent matches
        const { data: permMatch } = await supabaseAdmin
          .from('permanent_matches')
          .select('id')
          .eq('female_user_id', assignment.female_user.id)
          .single()

        let status = 'assigned'
        if (permMatch) {
          status = 'permanent'
        } else if (tempMatch) {
          status = 'matched'
        }

        return {
          female_user: assignment.female_user,
          assignment_count: assignmentCount,
          status,
          is_current_assignment: true
        }
      })
    )

    return NextResponse.json({
      assignments: assignmentDetails,
      success: true
    })

  } catch (error) {
    console.error('Error in user-assignments route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
