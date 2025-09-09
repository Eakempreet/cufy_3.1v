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
    console.log('Looking up user with email:', session.user.email)
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, gender, current_round')
      .eq('email', session.user.email)
      .single()

    console.log('User lookup result:', { currentUser, userError })

    if (!currentUser || userError) {
      console.error('User not found in database:', { email: session.user.email, userError })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the assignment details using user ID
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

    // Check if already revealed - only trust male_revealed column
    const alreadyRevealed = assignment.male_revealed === true
    if (alreadyRevealed) {
      // Get female profile for already revealed case
      const { data: femaleUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', assignment.female_user_id)
        .single()

      return NextResponse.json({
        success: true,
        message: 'Profile already selected as your final match',
        assignment: {
          id: assignment.id,
          female_user: femaleUser,
          status: assignment.status || 'selected',  // Use existing status or default to selected
          male_revealed: true,
          is_selected: assignment.is_selected || true,
          revealed_at: assignment.revealed_at || new Date().toISOString(),
          timer_expires_at: assignment.timer_expires_at
        }
      })
    }

    // Get female user details
    const { data: femaleUser, error: femaleError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', assignment.female_user_id)
      .single()

    if (femaleError || !femaleUser) {
      return NextResponse.json(
        { error: 'Female profile not found' },
        { status: 404 }
      )
    }

    // Update the assignment to mark as selected (final choice)
    const updateData = {
      status: 'selected' as const,  // Changed from 'revealed' to 'selected' - this is the final selection
      male_revealed: true,
      is_selected: true,            // Mark as selected since reveal = final selection
      revealed_at: new Date().toISOString(),
      timer_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hour timer
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabaseAdmin
      .from('profile_assignments')
      .update(updateData)
      .eq('id', assignmentId)

    if (updateError) {
      console.error('Assignment update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update assignment status' },
        { status: 500 }
      )
    }

    // NEW LOGIC: Do NOT hide other profiles when a male selects a female
    // This allows multiple males to independently select the same female
    // and keeps all assigned profiles visible to each male user
    console.log('Profile selected successfully - other profiles remain visible for independent selection')

    // Create a temporary match
    try {
      const { data: existingMatch } = await supabaseAdmin
        .from('temporary_matches')
        .select('*')
        .eq('male_user_id', currentUser.id)
        .eq('female_user_id', assignment.female_user_id)
        .single()

      if (!existingMatch) {
        const matchData = {
          male_user_id: currentUser.id,
          female_user_id: assignment.female_user_id,
          assignment_id: assignmentId,
          status: 'active' as const,
          male_disengaged: false,
          female_disengaged: false,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
        }

        await supabaseAdmin
          .from('temporary_matches')
          .insert(matchData)
      }
    } catch (createMatchError) {
      console.error('Temporary match creation error:', createMatchError)
      // Continue without temp match - at least user can see the profile
    }

    // If user is in round 2, update their status to "Match Found" (for admin panel)
    if (currentUser.current_round === 2) {
      try {
        // Note: Status column might not exist, so we'll skip this update for now
        console.log('User is in round 2 - would update status to "Match Found" if status column existed')
      } catch (error) {
        console.error('Failed to update user status:', error)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile selected successfully! You can continue to view and select other profiles.',
      assignment: {
        id: assignment.id,
        female_user: femaleUser,
        status: 'selected',        // Return selected status
        male_revealed: true,
        is_selected: true,         // Include selection flag
        revealed_at: new Date().toISOString(),
        timer_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      }
    })
  } catch (error) {
    console.error('Reveal profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
