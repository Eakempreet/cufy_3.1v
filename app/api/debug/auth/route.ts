import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        session: null
      }, { status: 401 })
    }

    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    return NextResponse.json({
      session: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      },
      user: user || null,
      error: error || null,
      isAdminEmail: session.user.email === 'cufy.online@gmail.com',
      userExists: !!user,
      dbError: error?.message || null
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
