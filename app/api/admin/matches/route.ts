import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const planType = searchParams.get('planType') // 'premium' or 'basic'
    
    console.log('Fetching matches data for plan:', planType)
    
    // Get male users with confirmed payments for the specified plan
    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        full_name,
        email,
        gender,
        age,
        university,
        profile_photo,
        subscription_type,
        payment_confirmed,
        current_round,
        round_1_completed,
        round_2_completed,
        decision_timer_active,
        decision_timer_expires_at,
        decision_timer_started_at,
        temp_match_id,
        permanent_match_id,
        match_confirmed_at,
        last_activity_at,
        created_at
      `)
      .eq('gender', 'male')
      .eq('payment_confirmed', true)
      
    if (planType && planType !== 'all') {
      query = query.eq('subscription_type', planType)
    }
    
    const { data: maleUsers, error: maleUsersError } = await query.order('created_at', { ascending: false })
    
    if (maleUsersError) {
      console.error('Error fetching male users:', maleUsersError)
      return NextResponse.json({ error: 'Failed to fetch male users' }, { status: 500 })
    }

    // Get all female users for assignment options with stats
    const { data: femaleUsers, error: femaleUsersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        full_name,
        email,
        age,
        university,
        profile_photo,
        bio,
        instagram,
        created_at
      `)
      .eq('gender', 'female')
      .order('created_at', { ascending: false })
    
    if (femaleUsersError) {
      console.error('Error fetching female users:', femaleUsersError)
      return NextResponse.json({ error: 'Failed to fetch female users' }, { status: 500 })
    }

    // Get female profile stats
    const { data: femaleStats } = await supabaseAdmin
      .from('female_profile_stats')
      .select('*')

    // Get assignments for all male users
    const maleUserIds = maleUsers?.map(user => user.id) || []
    const { data: assignments } = await supabaseAdmin
      .from('profile_assignments')
      .select(`
        *,
        female_user:users!profile_assignments_female_user_id_fkey (
          id,
          full_name,
          profile_photo
        )
      `)
      .in('male_user_id', maleUserIds)
    
    // Get temporary matches
    const { data: tempMatches } = await supabaseAdmin
      .from('temporary_matches')
      .select(`
        *,
        female_user:users!temporary_matches_female_user_id_fkey (
          id,
          full_name,
          profile_photo
        )
      `)
      .in('male_user_id', maleUserIds)
    
    // Get permanent matches  
    const { data: permMatches } = await supabaseAdmin
      .from('permanent_matches')
      .select(`
        *,
        female_user:users!permanent_matches_female_user_id_fkey (
          id,
          full_name,
          profile_photo
        )
      `)
      .in('male_user_id', maleUserIds)

    // Enhance male users with assignment data and round logic
    const enhancedMaleUsers = maleUsers?.map(user => {
      const userAssignments = assignments?.filter(a => a.male_user_id === user.id) || []
      const userTempMatch = tempMatches?.find(tm => tm.male_user_id === user.id)
      const userPermMatch = permMatches?.find(pm => pm.male_user_id === user.id)
      
      // Calculate assignment slots based on subscription and round
      const getMaxAssignments = (subscription: string, round: number) => {
        if (subscription === 'premium') {
          return round === 1 ? 2 : 3  // Round 1: 2 options, Round 2: 3 options
        } else {
          return 1  // Basic: 1 option per round
        }
      }
      
      const maxAssignments = getMaxAssignments(user.subscription_type, user.current_round)
      const currentAssignments = userAssignments.filter(a => a.status === 'assigned' && a.round_number === user.current_round).length
      const availableSlots = maxAssignments - currentAssignments
      
      // Check if user has selected a profile (timer active)
      const selectedAssignment = userAssignments.find(a => a.is_selected === true && a.status === 'revealed')
      const hasActiveTimer = user.decision_timer_active && user.decision_timer_expires_at && new Date(user.decision_timer_expires_at) > new Date()
      
      // Calculate time remaining if timer is active
      let timeRemaining = null
      if (hasActiveTimer && user.decision_timer_expires_at) {
        const expiresAt = new Date(user.decision_timer_expires_at).getTime()
        const now = new Date().getTime()
        timeRemaining = Math.max(0, expiresAt - now)
      }
      
      return {
        ...user,
        assignments: userAssignments,
        assignedCount: currentAssignments,
        revealedCount: userAssignments.filter(a => a.status === 'revealed').length,
        disengagedCount: userAssignments.filter(a => a.status === 'disengaged').length,
        maxAssignments,
        availableSlots,
        currentTempMatch: userTempMatch,
        permanentMatch: userPermMatch,
        selectedAssignment,
        hasActiveTimer,
        timeRemaining,
        decisionExpiresAt: user.decision_timer_expires_at,
        roundInfo: {
          current: user.current_round,
          round1Completed: user.round_1_completed,
          round2Completed: user.round_2_completed,
          canProgressToRound2: user.current_round === 1 && !user.round_1_completed && (userTempMatch || userPermMatch)
        },
        status: userPermMatch ? 'permanently_matched' : 
                userTempMatch ? 'temporary_match' :
                selectedAssignment && hasActiveTimer ? 'deciding' :
                currentAssignments > 0 ? 'assigned' : 'waiting'
      }
    })

    // Enhance female users with assignment statistics from stats table
    const enhancedFemaleUsers = femaleUsers?.map(female => {
      const stats = femaleStats?.find(s => s.female_user_id === female.id)
      const femaleAssignments = assignments?.filter(a => a.female_user_id === female.id) || []
      const femaleTempMatches = tempMatches?.filter(tm => tm.female_user_id === female.id) || []
      const femalePermMatches = permMatches?.filter(pm => pm.female_user_id === female.id) || []
      
      return {
        ...female,
        currentlyAssignedCount: stats?.currently_assigned_count || 0,
        assignedCount: stats?.assigned_count || 0,
        totalAssignedCount: stats?.total_assigned_count || 0,
        selectedCount: stats?.selected_count || 0,
        revealedCount: stats?.revealed_count || 0,
        permanentMatchCount: femalePermMatches.length,
        currentAssignments: femaleAssignments.filter(a => a.status === 'assigned'),
        currentTempMatches: femaleTempMatches.filter(tm => tm.status === 'active'),
        lastAssignedAt: stats?.last_assigned_at
      }
    })

    return NextResponse.json({
      maleUsers: enhancedMaleUsers || [],
      femaleUsers: enhancedFemaleUsers || [],
      totalMales: maleUsers?.length || 0,
      totalFemales: femaleUsers?.length || 0,
      statistics: {
        premiumUsers: enhancedMaleUsers?.filter(u => u.subscription_type === 'premium').length || 0,
        basicUsers: enhancedMaleUsers?.filter(u => u.subscription_type === 'basic').length || 0,
        assignedUsers: enhancedMaleUsers?.filter(u => u.assignedCount > 0).length || 0,
        waitingUsers: enhancedMaleUsers?.filter(u => u.status === 'waiting').length || 0,
        matchedUsers: enhancedMaleUsers?.filter(u => u.status === 'permanently_matched').length || 0
      }
    })
    
  } catch (error) {
    console.error('Matches API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, maleUserId, femaleUserId, data } = body
    
    console.log('Matches API POST action:', action)
    
    switch (action) {
      case 'assign_profile':
        return await assignProfile(maleUserId, femaleUserId, data?.round || 1)
      
      case 'select_profile':
        return await selectProfile(maleUserId, femaleUserId)
      
      case 'disengage_profile':
        return await disengageProfile(maleUserId, femaleUserId)
      
      case 'confirm_match':
        return await confirmMatch(maleUserId, femaleUserId)
      
      case 'progress_to_round_2':
        return await progressToRound2(maleUserId)
      
      case 'clear_history':
        return await clearUserHistory(maleUserId)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Matches API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions for match operations
async function assignProfile(maleUserId: string, femaleUserId: string, round: number) {
  try {
    // Check if male user exists and get subscription details
    const { data: maleUser, error: maleError } = await supabaseAdmin
      .from('users')
      .select('subscription_type, current_round, round_1_completed, round_2_completed, decision_timer_active')
      .eq('id', maleUserId)
      .single()
    
    if (maleError || !maleUser) {
      return NextResponse.json({ error: 'Male user not found' }, { status: 404 })
    }

    // Check if user has active timer (selected a profile already)
    if (maleUser.decision_timer_active) {
      return NextResponse.json({ 
        error: 'User has already selected a profile and timer is active. Cannot assign more profiles.' 
      }, { status: 400 })
    }

    // Determine max assignments based on subscription and round
    const getMaxAssignments = (subscription: string, roundNum: number) => {
      if (subscription === 'premium') {
        return roundNum === 1 ? 2 : 3  // Round 1: 2 options, Round 2: 3 options
      } else {
        return 1  // Basic: 1 option per round
      }
    }
    
    const maxAssignments = getMaxAssignments(maleUser.subscription_type, maleUser.current_round)
    
    // Get current assignments for this user in current round
    const { data: currentAssignments } = await supabaseAdmin
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', maleUserId)
      .eq('round_number', maleUser.current_round)
      .eq('status', 'assigned')
    
    if (currentAssignments && currentAssignments.length >= maxAssignments) {
      return NextResponse.json({ 
        error: `Maximum assignments reached for round ${maleUser.current_round}. ${maleUser.subscription_type} plan allows ${maxAssignments} assignments per round.` 
      }, { status: 400 })
    }

    // Check if this female profile was already assigned to this male user before
    const { data: previousAssignment } = await supabaseAdmin
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', maleUserId)
      .eq('female_user_id', femaleUserId)
      .single()
    
    if (previousAssignment) {
      if (previousAssignment.status === 'disengaged') {
        return NextResponse.json({ 
          error: 'This female profile cannot be reassigned to this male user as he disengaged earlier.' 
        }, { status: 400 })
      } else if (previousAssignment.status === 'assigned') {
        return NextResponse.json({ 
          error: 'This female profile is already assigned to this male user.' 
        }, { status: 400 })
      }
    }

    // Create the assignment
    const { data: assignment, error: assignError } = await supabaseAdmin
      .from('profile_assignments')
      .insert({
        male_user_id: maleUserId,
        female_user_id: femaleUserId,
        status: 'assigned',
        round_number: maleUser.current_round,
        assigned_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (assignError) {
      console.error('Assignment creation error:', assignError)
      return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      assignment,
      message: `Profile assigned successfully for Round ${maleUser.current_round}` 
    })
    
  } catch (error) {
    console.error('Assign profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function selectProfile(maleUserId: string, femaleUserId: string) {
  try {
    // Get the assignment
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', maleUserId)
      .eq('female_user_id', femaleUserId)
      .eq('status', 'assigned')
      .single()
    
    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Check if user already has an active selection
    const { data: existingSelection } = await supabaseAdmin
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', maleUserId)
      .eq('is_selected', true)
      .eq('status', 'revealed')
      .single()
    
    if (existingSelection) {
      return NextResponse.json({ error: 'User already has an active selection' }, { status: 400 })
    }

    // Start the 48-hour decision timer using database function
    const { error: timerError } = await supabaseAdmin
      .rpc('start_decision_timer', { assignment_id: assignment.id })
    
    if (timerError) {
      console.error('Timer start error:', timerError)
      // Fallback to manual timer start if function doesn't exist
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 48)
      
      // Update assignment
      await supabaseAdmin
        .from('profile_assignments')
        .update({ 
          is_selected: true,
          selected_at: new Date().toISOString(),
          timer_started_at: new Date().toISOString(),
          timer_expires_at: expiresAt.toISOString(),
          status: 'revealed'
        })
        .eq('id', assignment.id)

      // Update user
      await supabaseAdmin
        .from('users')
        .update({
          decision_timer_active: true,
          decision_timer_started_at: new Date().toISOString(),
          decision_timer_expires_at: expiresAt.toISOString(),
          last_activity_at: new Date().toISOString()
        })
        .eq('id', maleUserId)

      // Hide other assigned profiles
      await supabaseAdmin
        .from('profile_assignments')
        .update({ status: 'hidden' })
        .eq('male_user_id', maleUserId)
        .eq('status', 'assigned')
        .neq('id', assignment.id)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile selected! 48-hour decision timer started. Other profiles are now hidden.' 
    })
    
  } catch (error) {
    console.error('Select profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function disengageProfile(maleUserId: string, femaleUserId: string) {
  try {
    // Update assignment status to disengaged
    const { error: updateError } = await supabaseAdmin
      .from('profile_assignments')
      .update({ 
        status: 'disengaged',
        disengaged_at: new Date().toISOString(),
        is_selected: false
      })
      .eq('male_user_id', maleUserId)
      .eq('female_user_id', femaleUserId)
    
    if (updateError) {
      return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
    }

    // Disable decision timer and reveal other profiles if any
    await supabaseAdmin
      .from('users')
      .update({
        decision_timer_active: false,
        decision_timer_expires_at: null,
        decision_timer_started_at: null
      })
      .eq('id', maleUserId)

    // Reveal hidden profiles back to assigned status
    await supabaseAdmin
      .from('profile_assignments')
      .update({ status: 'assigned' })
      .eq('male_user_id', maleUserId)
      .eq('status', 'hidden')

    return NextResponse.json({ 
      success: true,
      message: 'Profile disengaged successfully. Other profiles are now visible again.' 
    })
    
  } catch (error) {
    console.error('Disengage profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function progressToRound2(maleUserId: string) {
  try {
    // Get user current state
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('current_round, round_1_completed, subscription_type')
      .eq('id', maleUserId)
      .single()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.current_round !== 1) {
      return NextResponse.json({ error: 'User is not in round 1' }, { status: 400 })
    }

    // Update user to round 2
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        current_round: 2,
        round_1_completed: true,
        decision_timer_active: false,
        decision_timer_expires_at: null,
        decision_timer_started_at: null
      })
      .eq('id', maleUserId)
    
    if (updateError) {
      return NextResponse.json({ error: 'Failed to update user round' }, { status: 500 })
    }

    // Disengage any active temporary matches from round 1
    await supabaseAdmin
      .from('temporary_matches')
      .update({ status: 'disengaged' })
      .eq('male_user_id', maleUserId)
      .eq('status', 'active')

    // Mark round 1 assignments as completed
    await supabaseAdmin
      .from('profile_assignments')
      .update({ status: 'round_completed' })
      .eq('male_user_id', maleUserId)
      .eq('round_number', 1)
      .in('status', ['assigned', 'revealed', 'hidden'])

    return NextResponse.json({ 
      success: true,
      message: 'Successfully progressed to Round 2! User can now receive new assignments.' 
    })
    
  } catch (error) {
    console.error('Progress to round 2 error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function requestRound2(maleUserId: string) {
  try {
    // Update user round information
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        round_2_requested: true,
        round_2_requested_at: new Date().toISOString(),
        current_round: 2,
        decision_timer_active: false,
        decision_timer_expires_at: null
      })
      .eq('id', maleUserId)
    
    if (updateError) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // Update temporary match status to disengaged
    await supabaseAdmin
      .from('temporary_matches')
      .update({ status: 'disengaged' })
      .eq('male_user_id', maleUserId)
      .eq('status', 'active')

    return NextResponse.json({ 
      success: true,
      message: 'Round 2 requested successfully' 
    })
    
  } catch (error) {
    console.error('Request round 2 error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function confirmMatch(maleUserId: string, femaleUserId: string) {
  try {
    // Create permanent match
    const { data: permMatch, error: permError } = await supabaseAdmin
      .from('permanent_matches')
      .insert({
        male_user_id: maleUserId,
        female_user_id: femaleUserId,
        status: 'active'
      })
      .select()
      .single()
    
    if (permError) {
      return NextResponse.json({ error: 'Failed to create permanent match' }, { status: 500 })
    }

    // Update user status
    await supabaseAdmin
      .from('users')
      .update({
        permanent_match_id: permMatch.id,
        match_confirmed_at: new Date().toISOString(),
        decision_timer_active: false,
        decision_timer_expires_at: null
      })
      .eq('id', maleUserId)

    // Update temporary match status
    await supabaseAdmin
      .from('temporary_matches')
      .update({ status: 'promoted' })
      .eq('male_user_id', maleUserId)
      .eq('status', 'active')

    return NextResponse.json({ 
      success: true,
      permMatch,
      message: 'Match confirmed permanently' 
    })
    
  } catch (error) {
    console.error('Confirm match error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function clearUserHistory(maleUserId: string) {
  try {
    // Delete all assignments
    await supabaseAdmin
      .from('profile_assignments')
      .delete()
      .eq('male_user_id', maleUserId)
    
    // Delete temporary matches
    await supabaseAdmin
      .from('temporary_matches')
      .delete()
      .eq('male_user_id', maleUserId)
    
    // Delete permanent matches
    await supabaseAdmin
      .from('permanent_matches')
      .delete()
      .eq('male_user_id', maleUserId)
    
    // Reset user data
    await supabaseAdmin
      .from('users')
      .update({
        current_round: 1,
        round_1_completed: false,
        round_2_completed: false,
        decision_timer_active: false,
        decision_timer_expires_at: null,
        decision_timer_started_at: null,
        temp_match_id: null,
        permanent_match_id: null,
        match_confirmed_at: null,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', maleUserId)

    return NextResponse.json({ 
      success: true,
      message: 'User history cleared successfully. User reset to Round 1.' 
    })
    
  } catch (error) {
    console.error('Clear history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
