import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing userId or action' }, 
        { status: 400 }
      )
    }

    console.log(`Performing action: ${action} on user: ${userId}`, data)

    let updateData: any = {}

    switch (action) {
      case 'suspend':
        updateData = {
          is_suspended: true,
          suspension_reason: data?.reason || 'No reason provided',
          suspension_duration: data?.duration || '7 days',
          suspended_at: new Date().toISOString()
        }
        break

      case 'ban':
        updateData = {
          is_banned: true,
          ban_reason: data?.reason || 'No reason provided',
          banned_at: new Date().toISOString()
        }
        break

      case 'verify':
        updateData = {
          is_verified: true,
          verified_at: new Date().toISOString()
        }
        break

      case 'reset_password':
        // For password reset, we might need to send an email
        // For now, just mark that a reset was requested
        updateData = {
          password_reset_requested: true,
          password_reset_requested_at: new Date().toISOString()
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        )
    }

    // Update the user in the database
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      )
    }

    console.log(`Successfully performed action: ${action} on user: ${userId}`)

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      action,
      message: `User ${action} completed successfully`
    })

  } catch (error) {
    console.error('User action error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}