-- Create admin notes table for storing admin notes about users
CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for admin notes
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to insert notes
CREATE POLICY "Admins can insert notes" ON admin_notes
  FOR INSERT
  WITH CHECK (
    admin_email IN ('cufy.online@gmail.com', 'eakampreet@gmail.com')
  );

-- Policy: Allow admins to view all notes
CREATE POLICY "Admins can view all notes" ON admin_notes
  FOR SELECT
  USING (
    admin_email IN ('cufy.online@gmail.com', 'eakampreet@gmail.com')
  );

-- Policy: Allow admins to update their own notes
CREATE POLICY "Admins can update notes" ON admin_notes
  FOR UPDATE
  USING (
    admin_email IN ('cufy.online@gmail.com', 'eakampreet@gmail.com')
  );

-- Policy: Allow admins to delete notes
CREATE POLICY "Admins can delete notes" ON admin_notes
  FOR DELETE
  USING (
    admin_email IN ('cufy.online@gmail.com', 'eakampreet@gmail.com')
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_notes_user_id ON admin_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON admin_notes(created_at DESC);
