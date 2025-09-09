import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assignmentId } = await request.json()

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
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

    // Only males can disengage
    if (currentUser.gender !== 'male') {
      return NextResponse.json({ error: 'Only male users can disengage' }, { status: 403 })
    }

    // Get the assignment details
    const { data: assignment, error: fetchError } = await supabaseAdmin
      .from('profile_assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('male_user_id', currentUser.id)
      .single()

    if (fetchError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if assignment can be disengaged (revealed or selected profiles)
    if (!['revealed', 'selected'].includes(assignment.status)) {
      return NextResponse.json(
        { error: 'Can only disengage from revealed or selected assignments' },
        { status: 400 }
      )
    }

    console.log(`🔄 User ${currentUser.email} disengaging from specific assignment ${assignmentId}...`)

    // For the new system: Only disengage from this specific assignment
    // Mark this specific assignment as disengaged
    const { error: updateError } = await supabaseAdmin
      .from('profile_assignments')
      .update({
        status: 'disengaged',
        is_selected: false,
        disengaged_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)

    if (updateError) {
      console.error('Error disengaging from assignment:', updateError)
      return NextResponse.json(
        { error: 'Failed to disengage from assignment' },
        { status: 500 }
      )
    }

    // If this assignment was selected, remove this male user from the female user's selected list
    if (assignment.is_selected) {
      await supabaseAdmin
        .from('users')
        .update({ 
          selected_male_user_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignment.female_user_id)
        .eq('selected_male_user_id', currentUser.id)
      
      console.log(`✅ Removed male user ${currentUser.id} from female user ${assignment.female_user_id}'s selection`)
    }

    // Remove any temporary matches for this specific assignment
    const { error: tempMatchError } = await supabaseAdmin
      .from('temporary_matches')
      .delete()
      .eq('assignment_id', assignmentId)

    if (tempMatchError) {
      console.error('Error removing temporary match:', tempMatchError)
    } else {
      console.log('✅ Successfully removed temporary match for this assignment')
    }

    console.log(`✅ User ${currentUser.email} successfully disengaged from specific assignment - other assignments remain active`)

    return NextResponse.json({ 
      success: true,
      message: 'Successfully disengaged from this profile. Your other assignments remain active.',
      changes: {
        specificAssignmentDisengaged: true,
        otherAssignmentsKept: true,
        femaleSelectionCleared: assignment.is_selected,
        temporaryMatchRemoved: true
      }
    })

  } catch (error) {
    console.error('Specific disengage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
