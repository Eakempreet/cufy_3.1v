import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== 'cufy.online@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update all users with confirmed payments to have active subscription status
    const { data: updatedUsers, error } = await supabaseAdmin
      .from('users')
      .update({ 
        subscription_status: 'active'
      })
      .eq('payment_confirmed', true)
      .eq('gender', 'male')
      .not('subscription_type', 'is', null)
      .select()

    if (error) {
      console.error('Error updating users:', error)
      return NextResponse.json({ error: 'Failed to update users' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updatedUsers?.length || 0} users with confirmed payments to active status`,
      updatedUsers: updatedUsers
    })
  } catch (error) {
    console.error('Error in fix-users API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
