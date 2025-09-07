import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Admin emails
const ADMIN_EMAILS = ['cufy.online@gmail.com', 'eakampreet@gmail.com']

export async function PUT(request: NextRequest) {
  try {
    const { userId, adminEmail, updates } = await request.json()

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!userId || !updates) {
      return NextResponse.json({ error: 'User ID and updates are required' }, { status: 400 })
    }

    // Only allow specific fields to be updated
    const allowedFields = [
      'name', 'email', 'phone', 'college', 'year', 'course', 'branch',
      'age', 'height', 'location', 'interests', 'relationship_status',
      'instagram', 'subscription_type', 'subscription_status',
      'is_payment_verified', 'points', 'is_active'
    ]

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Add updated_at timestamp
    filteredUpdates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('users')
      .update(filteredUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json({ user: data, message: 'User updated successfully' })
  } catch (error) {
    console.error('Error in user update PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
