import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: assignments, error } = await supabaseAdmin
      .from('profile_assignments')
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
      console.error('Assignments error:', error)
      return NextResponse.json({ assignments: [] })
    }

    // Format assignments with proper structure
    const formattedAssignments = (assignments || []).map(assignment => ({
      ...assignment,
      // Handle missing columns gracefully
      status: assignment.status || 'active',
      male_revealed: assignment.male_revealed || false,
      female_revealed: assignment.female_revealed || false
    }))

    return NextResponse.json({ assignments: formattedAssignments })
  } catch (error) {
    console.error('Assignments fetch error:', error)
    return NextResponse.json({ assignments: [] })
  }
}
