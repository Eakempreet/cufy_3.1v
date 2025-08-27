import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { matchId, reason } = await request.json()

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      )
    }

    // Get the temporary match details
    const { data: match, error: fetchError } = await supabase
      .from('temporary_matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (fetchError || !match) {
      return NextResponse.json(
        { error: 'Temporary match not found' },
        { status: 404 }
      )
    }

    if (match.status !== 'active') {
      return NextResponse.json(
        { error: 'Match is not active' },
        { status: 400 }
      )
    }

    // Update the temporary match to disengaged
    const { error: updateError } = await supabase
      .from('temporary_matches')
      .update({
        status: 'disengaged',
        male_disengaged: true,
        female_disengaged: true
      })
      .eq('id', matchId)

    if (updateError) {
      console.error('Match update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update match' },
        { status: 500 }
      )
    }

    // Log disengagement history
    await supabase
      .from('disengagement_history')
      .insert({
        temporary_match_id: matchId,
        male_user_id: match.male_user_id,
        female_user_id: match.female_user_id,
        disengaged_by: 'admin',
        reason: reason || 'Admin forced disengagement',
        disengaged_at: new Date().toISOString()
      })

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        action_type: 'force_disengage',
        target_user_id: match.male_user_id,
        details: {
          match_id: matchId,
          male_user_id: match.male_user_id,
          female_user_id: match.female_user_id,
          reason: reason || 'Admin forced disengagement'
        }
      })

    return NextResponse.json({ 
      success: true,
      message: 'Match disengaged successfully' 
    })
  } catch (error) {
    console.error('Force disengage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
