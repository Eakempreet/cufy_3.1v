import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Check if permanent_matches table exists, if not return empty array
    const { data: matches, error } = await supabaseAdmin
      .from('permanent_matches')
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
      console.error('Permanent matches error:', error)
      // Return empty array if table doesn't exist yet
      return NextResponse.json({ matches: [] })
    }

    // Format matches with default values for missing columns
    const formattedMatches = (matches || []).map(match => ({
      ...match,
      // Add default values for missing columns
      male_accepted: true, // Default for permanent matches
      female_accepted: true, // Default for permanent matches
      is_active: true,
      male_disengaged: false,
      female_disengaged: false
    }))

    return NextResponse.json({ matches: formattedMatches })
  } catch (error) {
    console.error('Permanent matches fetch error:', error)
    // Return empty array on error to prevent admin panel crash
    return NextResponse.json({ matches: [] })
  }
}
