import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { maleUserId, femaleUserId } = await request.json()

    if (!maleUserId || !femaleUserId) {
      return NextResponse.json(
        { error: 'Both male and female user IDs are required' },
        { status: 400 }
      )
    }

    // Check if male user already has 3 assignments
    const { count: maleAssignments } = await supabase
      .from('profile_assignments')
      .select('id', { count: 'exact' })
      .eq('male_user_id', maleUserId)

    if ((maleAssignments || 0) >= 3) {
      return NextResponse.json(
        { error: 'Male user already has maximum assignments' },
        { status: 400 }
      )
    }

    // Check if female user already has 2 assignments
    const { count: femaleAssignments } = await supabase
      .from('profile_assignments')
      .select('id', { count: 'exact' })
      .eq('female_user_id', femaleUserId)

    if ((femaleAssignments || 0) >= 2) {
      return NextResponse.json(
        { error: 'Female user already has maximum assignments' },
        { status: 400 }
      )
    }

    // Check if this specific assignment already exists
    const { data: existingAssignment } = await supabase
      .from('profile_assignments')
      .select('id')
      .eq('male_user_id', maleUserId)
      .eq('female_user_id', femaleUserId)
      .single()

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment already exists between these users' },
        { status: 400 }
      )
    }

    // Create the assignment
    const { data: assignment, error } = await supabase
      .from('profile_assignments')
      .insert({
        male_user_id: maleUserId,
        female_user_id: femaleUserId
      })
      .select()
      .single()

    if (error) {
      console.error('Assignment creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create assignment' },
        { status: 500 }
      )
    }

    // Log admin action (optional, ignore if table doesn't exist)
    try {
      await supabase
        .from('admin_actions')
        .insert({
          action_type: 'assign_profile',
          target_user_id: maleUserId,
          details: {
            male_user_id: maleUserId,
            female_user_id: femaleUserId,
            assignment_id: assignment.id
          }
        })
    } catch (logError) {
      console.log('Admin action logging failed (table may not exist):', logError)
    }

    return NextResponse.json({ 
      success: true, 
      assignment,
      message: 'Profile assigned successfully' 
    })
  } catch (error) {
    console.error('Assign profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
