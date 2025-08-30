import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { instagram } = await request.json()

    if (!instagram || !instagram.trim()) {
      return NextResponse.json({ error: 'Instagram username is required' }, { status: 400 })
    }

    // Clean the Instagram username (remove @ if present)
    const cleanInstagram = instagram.replace('@', '').trim()

    // Update user's Instagram profile
    const { data, error } = await supabase
      .from('users')
      .update({ 
        instagram: cleanInstagram,
        updated_at: new Date().toISOString()
      })
      .eq('email', session.user.email)
      .select()
      .single()

    if (error) {
      console.error('Error updating Instagram profile:', error)
      return NextResponse.json({ error: 'Failed to update Instagram profile' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      user: data,
      message: 'Instagram profile updated successfully'
    })

  } catch (error) {
    console.error('Error in update-instagram route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
