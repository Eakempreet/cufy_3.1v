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
        message: 'Profile already revealed',
        assignment: {
          id: assignment.id,
          female_user: femaleUser,
          status: 'revealed',
          male_revealed: true,
          revealed_at: assignment.revealed_at || new Date().toISOString()
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

    // Update the assignment to mark as revealed
    const updateData = {
      status: 'revealed' as const,
      male_revealed: true,
      revealed_at: new Date().toISOString(),
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

    return NextResponse.json({ 
      success: true,
      message: 'Profile revealed successfully!',
      assignment: {
        id: assignment.id,
        female_user: femaleUser,
        status: 'revealed',
        male_revealed: true,
        revealed_at: new Date().toISOString()
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
