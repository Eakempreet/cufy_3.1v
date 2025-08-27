import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabase } from '@/lib/supabase'

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ user: data || null })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updateData = await request.json()

    // Remove fields that shouldn't be updated via this endpoint
    const { id, email, created_at, updated_at, is_admin, ...allowedUpdates } = updateData

    const { data, error } = await supabase
      .from('users')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('email', session.user.email)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ user: data, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ user: data || null })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
