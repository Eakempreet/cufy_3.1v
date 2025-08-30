import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Admin emails
const ADMIN_EMAILS = ['cufy.online@gmail.com', 'eakampreet@gmail.com']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const adminEmail = searchParams.get('adminEmail')

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data: notes, error } = await supabase
      .from('admin_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admin notes:', error)
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error in admin notes GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, adminEmail, note } = await request.json()

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!userId || !note?.trim()) {
      return NextResponse.json({ error: 'User ID and note are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('admin_notes')
      .insert({
        user_id: userId,
        admin_email: adminEmail,
        note: note.trim()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating admin note:', error)
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
    }

    return NextResponse.json({ note: data })
  } catch (error) {
    console.error('Error in admin notes POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { noteId, adminEmail, note } = await request.json()

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!noteId || !note?.trim()) {
      return NextResponse.json({ error: 'Note ID and note content are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('admin_notes')
      .update({
        note: note.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .eq('admin_email', adminEmail)
      .select()
      .single()

    if (error) {
      console.error('Error updating admin note:', error)
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
    }

    return NextResponse.json({ note: data })
  } catch (error) {
    console.error('Error in admin notes PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')
    const adminEmail = searchParams.get('adminEmail')

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('admin_notes')
      .delete()
      .eq('id', noteId)
      .eq('admin_email', adminEmail)

    if (error) {
      console.error('Error deleting admin note:', error)
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in admin notes DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
