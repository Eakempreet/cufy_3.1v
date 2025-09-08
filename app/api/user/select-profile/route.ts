import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assignmentId } = await request.json()

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    // Get the current user
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, gender, current_round')
      .eq('email', session.user.email)
      .single()

    if (userError || !currentUser) {
      console.error('Error fetching current user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only males can select profiles in this flow
    if (currentUser.gender !== 'male') {
      return NextResponse.json({ error: 'Only male users can select profiles' }, { status: 403 })
    }

    // Get the assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('profile_assignments')
      .select(`
        id,
        male_user_id,
        female_user_id,
        status,
        male_revealed,
        round_number,
        female_user:female_user_id(id, full_name, email)
      `)
      .eq('id', assignmentId)
      .eq('male_user_id', currentUser.id)
      .single()

    if (assignmentError || !assignment) {
      console.error('Error fetching assignment:', assignmentError)
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Check if assignment has been revealed
    if (!assignment.male_revealed && assignment.status !== 'revealed') {
      return NextResponse.json({ error: 'Must reveal profile before selecting' }, { status: 400 })
    }

    // Check if already selected
    if (assignment.status === 'selected') {
      return NextResponse.json({ error: 'Profile already selected' }, { status: 400 })
    }

    // Calculate 48-hour expiration
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours from now

        // Update the assignment as selected and start timer
    const { error: updateError } = await supabase
      .from('profile_assignments')
      .update({
        status: 'selected',
        is_selected: true,
        selected_at: new Date().toISOString(),
        timer_expires_at: expiresAt.toISOString()
      })
      .eq('id', assignmentId)

    if (updateError) {
      console.error('Error updating assignment:', updateError)
      return NextResponse.json({ error: 'Failed to select profile' }, { status: 500 })
    }

    // Hide all other assigned profiles for this user AND reassign them back to available pool
    const { data: hiddenProfiles, error: hideError } = await supabase
      .from('profile_assignments')
      .update({ 
        status: 'hidden',
        // Reset these assignments so they can be reassigned to other users
        // Keep the assignment but mark it as available for reassignment
        updated_at: new Date().toISOString()
      })
      .eq('male_user_id', currentUser.id)
      .neq('id', assignmentId)
      .in('status', ['assigned', 'revealed']) // Hide both assigned and revealed profiles
      .select('id, status, female_user_id')

    if (hideError) {
      console.error('Error hiding other profiles:', hideError)
    } else {
      console.log('Successfully hid profiles:', hiddenProfiles?.length || 0, 'profiles hidden')
      console.log('Hidden profiles debug:', hiddenProfiles)
      
      // Optional: Delete the hidden assignments to make those female profiles available for other male users
      // This ensures efficient profile distribution
      if (hiddenProfiles && hiddenProfiles.length > 0) {
        const { error: deleteError } = await supabase
          .from('profile_assignments')
          .delete()
          .in('id', hiddenProfiles.map(p => p.id))
        
        if (deleteError) {
          console.error('Warning: Failed to delete hidden assignments:', deleteError)
        } else {
          console.log('✅ Deleted hidden assignments to free up profiles for other users')
        }
      }
    }

    // Update user with decision timer
    await supabase
      .from('users')
      .update({
        decision_timer_active: true,
        decision_timer_started_at: new Date().toISOString(),
        decision_timer_expires_at: expiresAt.toISOString(),
        last_activity_at: new Date().toISOString()
      })
      .eq('id', currentUser.id)

    // Create temporary match for the female user to see
    const { error: tempMatchError } = await supabase
      .from('temporary_matches')
      .insert({
        male_user_id: assignment.male_user_id,
        female_user_id: assignment.female_user_id,
        assignment_id: assignmentId,
        status: 'pending',
        round_number: assignment.round_number,
        male_accepted: true,
        male_accepted_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        decision_timer_started_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })

    if (tempMatchError) {
      console.error('Error creating temporary match:', tempMatchError)
      // Don't return error here as the assignment was already updated
    }

    // Schedule auto-confirmation after 48 hours (this would be handled by a background job in production)
    // For now, we'll rely on the front-end timer and manual confirmation

    return NextResponse.json({ 
      success: true, 
      message: 'Profile selected successfully! You have 48 hours to decide.',
      expiresAt: expiresAt.toISOString(),
      timer: '48:00:00',
      assignmentId,
      selectedProfile: assignment.female_user_id,
      hiddenProfilesCount: hiddenProfiles?.length || 0
    })

  } catch (error) {
    console.error('Error in select-profile API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
