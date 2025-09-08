import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userId') // Actually email for now
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    console.log('Fetching dashboard data for user email:', userEmail)
    
    // Get user details by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.gender === 'male') {
      return await getMaleDashboard(user.id, user)
    } else if (user.gender === 'female') {
      return await getFemaleDashboard(user.id, user)
    } else {
      return NextResponse.json({ error: 'Invalid user gender' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getMaleDashboard(userId: string, user: any) {
  try {
    // Get user's assignments
    const { data: assignments } = await supabaseAdmin
      .from('profile_assignments')
      .select(`
        *,
        female_user:users!profile_assignments_female_user_id_fkey (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          instagram
        )
      `)
      .eq('male_user_id', userId)
      .eq('status', 'assigned')
    
    // Get current temporary match
    const { data: tempMatch } = await supabaseAdmin
      .from('temporary_matches')
      .select(`
        *,
        female_user:users!temporary_matches_female_user_id_fkey (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          instagram
        )
      `)
      .eq('male_user_id', userId)
      .eq('status', 'active')
      .single()
    
    // Get permanent match
    const { data: permMatch } = await supabaseAdmin
      .from('permanent_matches')
      .select(`
        *,
        female_user:users!permanent_matches_female_user_id_fkey (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          instagram
        )
      `)
      .eq('male_user_id', userId)
      .eq('status', 'active')
      .single()

    // Calculate dashboard state
    const dashboardState = {
      user,
      assignedProfiles: assignments || [],
      currentTempMatch: tempMatch,
      permanentMatch: permMatch,
      canReveal: (assignments?.length || 0) > 0 && !tempMatch && !permMatch,
      hasActiveDecision: user.decision_timer_active && tempMatch,
      decisionExpiresAt: user.decision_timer_expires_at,
      canRequestRound2: user.subscription_type === 'premium' && 
                       user.current_round === 1 && 
                       tempMatch && 
                       user.decision_timer_active,
      isLocked: !!permMatch,
      maxAssignments: user.subscription_type === 'premium' ? 3 : 1
    }

    return NextResponse.json({ 
      success: true,
      type: 'male',
      dashboard: dashboardState
    })
    
  } catch (error) {
    console.error('Male dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch male dashboard' }, { status: 500 })
  }
}

async function getFemaleDashboard(userId: string, user: any) {
  try {
    // Get all temporary matches where she's selected
    const { data: tempMatches } = await supabaseAdmin
      .from('temporary_matches')
      .select(`
        *,
        male_user:users!temporary_matches_male_user_id_fkey (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          instagram
        )
      `)
      .eq('female_user_id', userId)
      .eq('status', 'active')
    
    // Get permanent matches
    const { data: permMatches } = await supabaseAdmin
      .from('permanent_matches')
      .select(`
        *,
        male_user:users!permanent_matches_male_user_id_fkey (
          id,
          full_name,
          age,
          university,
          profile_photo,
          bio,
          instagram
        )
      `)
      .eq('female_user_id', userId)
      .eq('status', 'active')

    // Calculate dashboard state
    const dashboardState = {
      user,
      maleProfiles: tempMatches?.map(tm => ({
        ...tm.male_user,
        tempMatchId: tm.id,
        selectedAt: tm.created_at,
        expiresAt: tm.expires_at
      })) || [],
      permanentMatches: permMatches?.map(pm => ({
        ...pm.male_user,
        permMatchId: pm.id,
        matchedAt: pm.created_at
      })) || []
    }

    return NextResponse.json({ 
      success: true,
      type: 'female',
      dashboard: dashboardState
    })
    
  } catch (error) {
    console.error('Female dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch female dashboard' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, data } = body // userId is actually email
    
    console.log('Dashboard API POST action:', action)
    
    // Get user ID from email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', userId)
      .single()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    switch (action) {
      case 'reveal_profile':
        return await revealProfile(user.id, data.assignmentId)
      
      case 'request_round_2':
        return await requestRound2(user.id)
      
      case 'confirm_match':
        return await confirmMatch(user.id)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Dashboard API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function revealProfile(userId: string, assignmentId: string) {
  try {
    // Get the assignment
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('profile_assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('male_user_id', userId)
      .eq('status', 'assigned')
      .single()
    
    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Check if user already has an active temporary match
    const { data: existingTempMatch } = await supabaseAdmin
      .from('temporary_matches')
      .select('*')
      .eq('male_user_id', userId)
      .eq('status', 'active')
      .single()
    
    if (existingTempMatch) {
      return NextResponse.json({ error: 'You already have an active selection' }, { status: 400 })
    }

    // Update assignment to revealed
    await supabaseAdmin
      .from('profile_assignments')
      .update({ 
        status: 'revealed',
        revealed_at: new Date().toISOString()
      })
      .eq('id', assignmentId)

    // Hide all other assigned profiles for this user
    await supabaseAdmin
      .from('profile_assignments')
      .update({ status: 'hidden' })
      .eq('male_user_id', userId)
      .eq('status', 'assigned')
      .neq('id', assignmentId)

    // Create temporary match with 48-hour timer
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48)
    
    const { data: tempMatch, error: tempError } = await supabaseAdmin
      .from('temporary_matches')
      .insert({
        male_user_id: userId,
        female_user_id: assignment.female_user_id,
        assignment_id: assignmentId,
        status: 'active',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()
    
    if (tempError) {
      return NextResponse.json({ error: 'Failed to create temporary match' }, { status: 500 })
    }

    // Update user's decision timer
    await supabaseAdmin
      .from('users')
      .update({
        decision_timer_active: true,
        decision_timer_expires_at: expiresAt.toISOString(),
        temp_match_id: tempMatch.id
      })
      .eq('id', userId)

    return NextResponse.json({ 
      success: true, 
      tempMatch,
      message: 'Profile revealed! You have 48 hours to decide.' 
    })
    
  } catch (error) {
    console.error('Reveal profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function requestRound2(userId: string) {
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
      .eq('id', userId)
    
    if (updateError) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // Update temporary match status to disengaged
    await supabaseAdmin
      .from('temporary_matches')
      .update({ status: 'disengaged' })
      .eq('male_user_id', userId)
      .eq('status', 'active')

    return NextResponse.json({ 
      success: true,
      message: 'Round 2 requested! You can now be assigned new profiles.' 
    })
    
  } catch (error) {
    console.error('Request round 2 error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function confirmMatch(userId: string) {
  try {
    // Get active temporary match
    const { data: tempMatch, error: tempError } = await supabaseAdmin
      .from('temporary_matches')
      .select('*')
      .eq('male_user_id', userId)
      .eq('status', 'active')
      .single()
    
    if (tempError || !tempMatch) {
      return NextResponse.json({ error: 'No active temporary match found' }, { status: 404 })
    }

    // Create permanent match
    const { data: permMatch, error: permError } = await supabaseAdmin
      .from('permanent_matches')
      .insert({
        temporary_match_id: tempMatch.id,
        male_user_id: userId,
        female_user_id: tempMatch.female_user_id,
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
      .eq('id', userId)

    // Update temporary match status
    await supabaseAdmin
      .from('temporary_matches')
      .update({ status: 'promoted' })
      .eq('id', tempMatch.id)

    return NextResponse.json({ 
      success: true,
      permMatch,
      message: 'Match confirmed! You can now connect with each other.' 
    })
    
  } catch (error) {
    console.error('Confirm match error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
