import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Admin emails
const ADMIN_EMAILS = ['cufy.online@gmail.com', 'eakampreet@gmail.com']

export async function PUT(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const { noteId, adminEmail, note } = await request.json()

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!params.noteId || !note?.trim()) {
      return NextResponse.json({ error: 'Note ID and note content are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('admin_notes')
      .update({
        note: note.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.noteId)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const adminEmail = searchParams.get('adminEmail')

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!params.noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('admin_notes')
      .delete()
      .eq('id', params.noteId)
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
