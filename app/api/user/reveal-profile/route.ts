import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

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

    // Get user ID from email
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the assignment details and verify ownership
    const { data: assignment, error: fetchError } = await supabase
      .from('profile_assignments')
      .select('id, male_user_id, female_user_id')
      .eq('id', assignmentId)
      .eq('male_user_id', user.id) // Ensure user owns this assignment
      .single()

    if (fetchError || !assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or unauthorized' },
        { status: 404 }
      )
    }

    // Since we don't have status column yet, create a temporary match directly
    // This simulates revealing the profile
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48) // 48 hours from now

    const { data: tempMatch, error: matchError } = await supabase
      .from('temporary_matches')
      .insert({
        male_user_id: assignment.male_user_id,
        female_user_id: assignment.female_user_id,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (matchError) {
      // Check if match already exists
      if (matchError.code === '23505') { // Unique constraint violation
        return NextResponse.json({
          success: true,
          message: 'Profile already revealed'
        })
      }
      console.error('Temporary match creation error:', matchError)
      return NextResponse.json(
        { error: 'Failed to reveal profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile revealed successfully',
      tempMatch 
    })
  } catch (error) {
    console.error('Reveal profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
