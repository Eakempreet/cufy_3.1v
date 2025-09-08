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

    const { matchId } = await request.json()

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 })
    }

    // Get the current user
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, gender')
      .eq('email', session.user.email)
      .single()

    if (userError || !currentUser) {
      console.error('Error fetching current user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only females can accept matches in this flow
    if (currentUser.gender !== 'female') {
      return NextResponse.json({ error: 'Only female users can accept matches' }, { status: 403 })
    }

    // Get the temporary match
    const { data: tempMatch, error: matchError } = await supabase
      .from('temporary_matches')
      .select(`
        id,
        male_user_id,
        female_user_id,
        expires_at,
        status,
        male_user:male_user_id(id, full_name, email),
        female_user:female_user_id(id, full_name, email)
      `)
      .eq('id', matchId)
      .eq('female_user_id', currentUser.id)
      .single()

    if (matchError || !tempMatch) {
      console.error('Error fetching temporary match:', matchError)
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Check if match has already expired
    if (new Date() > new Date(tempMatch.expires_at)) {
      return NextResponse.json({ error: 'Match has expired' }, { status: 400 })
    }

    // Check if match is still pending
    if (tempMatch.status !== 'pending') {
      return NextResponse.json({ error: 'Match is no longer pending' }, { status: 400 })
    }

    // Update the temporary match to show female accepted
    const { error: updateError } = await supabase
      .from('temporary_matches')
      .update({
        status: 'female_accepted',
        female_accepted: true,
        female_accepted_at: new Date().toISOString()
      })
      .eq('id', matchId)

    if (updateError) {
      console.error('Error updating temporary match:', updateError)
      return NextResponse.json({ error: 'Failed to accept match' }, { status: 500 })
    }

    // Check if the male user has also accepted (both_accepted)
    // If male already accepted, create permanent match
    const { data: updatedMatch, error: checkError } = await supabase
      .from('temporary_matches')
      .select('male_accepted, female_accepted')
      .eq('id', matchId)
      .single()

    if (checkError) {
      console.error('Error checking match status:', checkError)
      return NextResponse.json({ error: 'Failed to check match status' }, { status: 500 })
    }

    // If both have accepted, create permanent match
    if (updatedMatch.male_accepted && updatedMatch.female_accepted) {
      const { error: permanentError } = await supabase
        .from('permanent_matches')
        .insert({
          male_user_id: tempMatch.male_user_id,
          female_user_id: tempMatch.female_user_id,
          matched_at: new Date().toISOString(),
          status: 'active'
        })

      if (permanentError) {
        console.error('Error creating permanent match:', permanentError)
        // Don't return error here as the temporary match was already updated
      } else {
        // Update temporary match to completed
        await supabase
          .from('temporary_matches')
          .update({ status: 'both_accepted' })
          .eq('id', matchId)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Match accepted successfully',
      bothAccepted: updatedMatch.male_accepted && updatedMatch.female_accepted
    })

  } catch (error) {
    console.error('Error in accept-match API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
