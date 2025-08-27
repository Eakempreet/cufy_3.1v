import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from email
    const { data: user } = await supabase
      .from('users')
      .select('id, gender')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let assignments = []
    
    if (user.gender === 'male') {
      // Male users: get their assigned female profiles
      const { data, error } = await supabase
        .from('profile_assignments')
        .select(`
          id,
          created_at,
          female_user:female_user_id (
            id,
            full_name,
            age,
            university,
            profile_photo,
            bio
          )
        `)
        .eq('male_user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
      }
      
      // Add default values for fields that don't exist in the database yet
      assignments = (data || []).map(assignment => ({
        ...assignment,
        status: 'assigned', // Default status
        assigned_at: assignment.created_at,
        revealed_at: null // Default to null
      }))
    } else {
      // Female users: get assignments where they are the female user (for status display only)
      const { data, error } = await supabase
        .from('profile_assignments')
        .select(`
          id,
          created_at,
          male_user:male_user_id (
            id,
            full_name
          )
        `)
        .eq('female_user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
      }
      
      // Add default values for female user assignments
      assignments = (data || []).map(assignment => ({
        ...assignment,
        status: 'assigned',
        assigned_at: assignment.created_at
      }))
    }

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('Assignments fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
