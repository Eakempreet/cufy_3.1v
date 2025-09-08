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
      .select('id, email, gender, current_round, subscription_type')
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

    // Check if in round 2 (no disengage allowed in final round)
    if (currentUser.current_round === 2) {
      return NextResponse.json({ 
        error: 'Cannot disengage in Round 2 - this is your final choice!' 
      }, { status: 400 })
    }

    // Check if assignment can be disengaged (revealed or selected profiles)
    if (!['revealed', 'selected'].includes(assignment.status)) {
      return NextResponse.json(
        { error: 'Can only disengage from revealed or selected assignments' },
        { status: 400 }
      )
    }

    console.log(`🔄 User ${currentUser.email} completely disengaging - removing ALL assignments including selected one...`)

    // First, get all assignments for this user to identify affected female users
    const { data: allUserAssignments } = await supabaseAdmin
      .from('profile_assignments')
      .select('id, female_user_id, status, is_selected')
      .eq('male_user_id', currentUser.id)

    console.log(`Found ${allUserAssignments?.length || 0} assignments to process`)

    // Get female users who had this male user as selected
    const selectedFemaleUsers = allUserAssignments?.filter(a => a.is_selected) || []
    const selectedFemaleCount = selectedFemaleUsers.length
    
    if (selectedFemaleUsers.length > 0) {
      console.log(`Removing male user from ${selectedFemaleUsers.length} female users' selected lists`)
      
      // Remove this male user from female users' selected_male_user_id 
      for (const assignment of selectedFemaleUsers) {
        await supabaseAdmin
          .from('users')
          .update({ 
            selected_male_user_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', assignment.female_user_id)
          .eq('selected_male_user_id', currentUser.id) // Only if this male was selected
        
        console.log(`✅ Removed male user ${currentUser.id} from female user ${assignment.female_user_id}'s selection`)
      }
    }

    // COMPLETELY REMOVE ALL assignments for this user (including the current one)
    const { error: removeAllAssignmentsError } = await supabaseAdmin
      .from('profile_assignments')
      .delete()
      .eq('male_user_id', currentUser.id) // Remove ALL assignments, no exceptions

    if (removeAllAssignmentsError) {
      console.error('Error removing all assignments:', removeAllAssignmentsError)
      return NextResponse.json(
        { error: 'Failed to remove all assignments' },
        { status: 500 }
      )
    } else {
      console.log('✅ Successfully removed ALL assigned profiles including the selected one')
    }

    // 3. Remove ALL temporary matches for this user (not just update status)
    const { error: tempMatchError } = await supabaseAdmin
      .from('temporary_matches')
      .delete()
      .eq('male_user_id', currentUser.id)

    if (tempMatchError) {
      console.error('Error removing temporary matches:', tempMatchError)
    } else {
      console.log('✅ Successfully removed all temporary matches')
    }

    // 4. Progress user to next round and reset decision timer
    const nextRound = currentUser.current_round + 1
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        current_round: nextRound,
        round_1_completed: nextRound > 1,
        decision_timer_active: false,
        decision_timer_expires_at: null,
        decision_timer_started_at: null,
        selected_male_user_id: null, // Clear any selection this user might have made
        last_activity_at: new Date().toISOString()
      })
      .eq('id', currentUser.id)

    if (userUpdateError) {
      console.error('Error updating user round:', userUpdateError)
      return NextResponse.json({ error: `Failed to progress to Round ${nextRound}` }, { status: 500 })
    }

    console.log(`✅ User ${currentUser.email} completely disengaged - ALL profiles removed and female selections updated`)

    return NextResponse.json({ 
      success: true,
      message: 'Complete disengage successful! ALL profiles removed and you have been moved to the next round.',
      nextRound: nextRound,
      changes: {
        allAssignmentsRemoved: true,
        femaleSelectionsCleared: selectedFemaleCount > 0,
        affectedFemaleUsers: selectedFemaleCount,
        temporaryMatchesRemoved: true,
        movedToNextRound: true,
        timerReset: true,
        completeClear: true
      }
    })

  } catch (error) {
    console.error('Disengage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
