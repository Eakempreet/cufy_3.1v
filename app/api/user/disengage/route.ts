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

    const { matchId } = await request.json()

    if (!matchId) {
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

    // Get the assignment details - boys can only disengage from assignments where they are the male user
    const { data: assignment, error: fetchError } = await supabaseAdmin
      .from('profile_assignments')
      .select('*')
      .eq('id', matchId)
      .eq('male_user_id', currentUser.id) // Only allow male users to disengage
      .single()

    if (fetchError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if assignment is revealed (can only disengage revealed assignments)
    if (!assignment.male_revealed) {
      return NextResponse.json(
        { error: 'Cannot disengage from unrevealed assignment' },
        { status: 400 }
      )
    }

    // Check if already disengaged
    if (assignment.status === 'disengaged') {
      return NextResponse.json(
        { error: 'Already disengaged from this assignment' },
        { status: 400 }
      )
    }

    // Update assignment to disengaged status
    const { error: updateError } = await supabaseAdmin
      .from('profile_assignments')
      .update({
        status: 'disengaged' as const,
        disengaged_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)

    if (updateError) {
      console.error('Assignment update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to disengage from assignment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully disengaged from assignment. Profile has been blurred.'
    })

  } catch (error) {
    console.error('Disengage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
