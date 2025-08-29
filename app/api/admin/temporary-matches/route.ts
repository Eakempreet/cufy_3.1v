import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: matches, error } = await supabaseAdmin
      .from('temporary_matches')
      .select(`
        *,
        male_user:male_user_id (
          id,
          full_name,
          age,
          university,
          profile_photo
        ),
        female_user:female_user_id (
          id,
          full_name,
          age,
          university,
          profile_photo
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Temporary matches error:', error)
      return NextResponse.json({ matches: [] })
    }

    // Format matches with proper structure
    const formattedMatches = (matches || []).map(match => ({
      ...match,
      // Handle missing columns gracefully
      male_disengaged: match.male_disengaged || false,
      female_disengaged: match.female_disengaged || false,
      expires_at: match.expires_at || null
    }))

    return NextResponse.json({ matches: formattedMatches })
  } catch (error) {
    console.error('Temporary matches fetch error:', error)
    return NextResponse.json({ matches: [] })
  }
}
