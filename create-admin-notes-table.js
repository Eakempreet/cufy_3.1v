require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminNotesTable() {
  try {
    console.log('Creating admin_notes table...');
    
    // Check if table exists first
    const { data: tables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'admin_notes');

    if (checkError) {
      console.error('Error checking table existence:', checkError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ admin_notes table already exists!');
      return;
    }

    // Since we can't use exec_sql, let's try to create the table manually
    // First, let's test the connection by checking if we can query users table
    const { data: usersTest, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError) {
      console.error('Error accessing users table:', usersError);
      return;
    }

    console.log('Connection successful, but we need to create the table manually in Supabase dashboard.');
    console.log('Please run the following SQL in your Supabase SQL editor:');
    console.log(`
-- Create admin notes table
CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_email TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can insert notes" ON admin_notes 
  FOR INSERT WITH CHECK (admin_email IN ('admin@cufy.com', 'eakampreet@gmail.com'));

CREATE POLICY "Admins can view all notes" ON admin_notes 
  FOR SELECT USING (admin_email IN ('admin@cufy.com', 'eakampreet@gmail.com'));

CREATE POLICY "Admins can update notes" ON admin_notes 
  FOR UPDATE USING (admin_email IN ('admin@cufy.com', 'eakampreet@gmail.com'));

CREATE POLICY "Admins can delete notes" ON admin_notes 
  FOR DELETE USING (admin_email IN ('admin@cufy.com', 'eakampreet@gmail.com'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_notes_user_id ON admin_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON admin_notes(created_at DESC);
    `);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminNotesTable();
