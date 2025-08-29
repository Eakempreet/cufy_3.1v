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
      .select('id, gender')
      .eq('email', session.user.email)
      .single()

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only male users can reveal profiles
    if (currentUser.gender !== 'male') {
      return NextResponse.json(
        { error: 'Only male users can reveal profiles' },
        { status: 403 }
      )
    }

    // Get the assignment details and verify ownership
    const { data: assignment, error: fetchError } = await supabaseAdmin
      .from('profile_assignments')
      .select(`
        id, 
        male_user_id, 
        female_user_id,
        created_at,
        female_user:users!profile_assignments_female_user_id_fkey(
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          gender
        )
      `)
      .eq('id', assignmentId)
      .eq('male_user_id', currentUser.id) // Ensure user owns this assignment
      .single()

    if (fetchError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if user is currently in any temporary matches (should not be able to reveal new profiles)
    const { data: userTempMatch } = await supabaseAdmin
      .from('temporary_matches')
      .select('id')
      .eq('male_user_id', currentUser.id)
      .single()

    if (userTempMatch) {
      return NextResponse.json(
        { error: 'Cannot reveal new profiles while in temporary match. Please disengage first.' },
        { status: 400 }
      )
    }

    // Check if female user is currently in any temporary matches
    const { data: femaleTempMatch } = await supabaseAdmin
      .from('temporary_matches')
      .select('id')
      .eq('female_user_id', assignment.female_user_id)
      .single()

    if (femaleTempMatch) {
      return NextResponse.json(
        { error: 'The female user is currently in a temporary match and cannot receive new reveals.' },
        { status: 400 }
      )
    }

    // Create a temporary match (48 hours for decision)
    const expirationTime = new Date()
    expirationTime.setHours(expirationTime.getHours() + 48) // 48 hours from now

    const { data: newTempMatch, error: createMatchError } = await supabaseAdmin
      .from('temporary_matches')
      .insert({
        male_user_id: assignment.male_user_id,
        female_user_id: assignment.female_user_id,
        expires_at: expirationTime.toISOString()
      })
      .select()
      .single()

    if (createMatchError) {
      // Check if match already exists
      if (createMatchError.code === '23505') { // Unique constraint violation
        return NextResponse.json({
          success: true,
          message: 'Profile already revealed and temporary match exists'
        })
      }
      console.error('Temporary match creation error:', createMatchError)
      return NextResponse.json(
        { error: 'Failed to create temporary match' },
        { status: 500 }
      )
    }

    // IMPORTANT: Unassign other profiles for this male user
    // When a user reveals one profile, all other assignments become available for reassignment
    try {
      await supabaseAdmin
        .from('profile_assignments')
        .update({ status: 'expired' })
        .eq('male_user_id', assignment.male_user_id)
        .neq('id', assignmentId) // Don't affect the current assignment
        .eq('status', 'active')
    } catch (unassignError) {
      console.log('Warning: Failed to unassign other profiles:', unassignError)
      // Continue execution - this is not critical enough to fail the reveal
    }

    // Log the reveal action (optional)
    try {
      await supabaseAdmin
        .from('user_actions')
        .insert({
          user_id: currentUser.id,
          action_type: 'reveal_profile',
          target_user_id: assignment.female_user_id,
          details: {
            assignment_id: assignmentId,
            temp_match_id: newTempMatch.id
          }
        })
    } catch (logError) {
      console.log('User action logging failed (table may not exist):', logError)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile revealed successfully. Both users now have 48 hours to decide.',
      assignment: {
        id: assignment.id,
        female_user: assignment.female_user,
        status: 'revealed',
        male_revealed: true,
        revealed_at: new Date().toISOString()
      },
      tempMatch: newTempMatch
    })
  } catch (error) {
    console.error('Reveal profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
