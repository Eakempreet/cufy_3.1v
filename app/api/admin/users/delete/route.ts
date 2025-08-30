import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      const response = NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 })
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      return response
    }

    // Delete user from database
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Delete user error:', error)
      const response = NextResponse.json({ 
        success: false, 
        error: 'Failed to delete user' 
      }, { status: 500 })
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      return response
    }

    const response = NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    })
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Delete user error:', error)
    const response = NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response
  }
}
