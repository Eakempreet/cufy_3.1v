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

    const { matchId } = await request.json()

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
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

    // Get the temporary match details and verify user is part of it
    const { data: match, error: fetchError } = await supabase
      .from('temporary_matches')
      .select('id, male_user_id, female_user_id, created_at')
      .eq('id', matchId)
      .or(`male_user_id.eq.${user.id},female_user_id.eq.${user.id}`)
      .single()

    if (fetchError || !match) {
      return NextResponse.json(
        { error: 'Temporary match not found or unauthorized' },
        { status: 404 }
      )
    }

    // Since we don't have disengaged columns yet, simply delete the temporary match
    // This simulates disengagement
    const { error: deleteError } = await supabase
      .from('temporary_matches')
      .delete()
      .eq('id', matchId)

    if (deleteError) {
      console.error('Match delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to disengage from match' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully disengaged from match' 
    })
  } catch (error) {
    console.error('Disengage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
