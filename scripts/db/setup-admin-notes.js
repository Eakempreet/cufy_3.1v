const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupAdminNotes() {
  console.log('Setting up admin notes table...')
  
  try {
    // Create the table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
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
        DROP POLICY IF EXISTS "Admins can insert notes" ON admin_notes;
        CREATE POLICY "Admins can insert notes" ON admin_notes
          FOR INSERT
          WITH CHECK (admin_email IN ('admin@cufy.com', 'eakampreet@gmail.com'));

        DROP POLICY IF EXISTS "Admins can view all notes" ON admin_notes;
        CREATE POLICY "Admins can view all notes" ON admin_notes
          FOR SELECT
          USING (admin_email IN ('admin@cufy.com', 'eakampreet@gmail.com'));

        DROP POLICY IF EXISTS "Admins can update notes" ON admin_notes;
        CREATE POLICY "Admins can update notes" ON admin_notes
          FOR UPDATE
          USING (admin_email IN ('admin@cufy.com', 'eakampreet@gmail.com'));

        DROP POLICY IF EXISTS "Admins can delete notes" ON admin_notes;
        CREATE POLICY "Admins can delete notes" ON admin_notes
          FOR DELETE
          USING (admin_email IN ('admin@cufy.com', 'eakampreet@gmail.com'));

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_admin_notes_user_id ON admin_notes(user_id);
        CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON admin_notes(created_at DESC);
      `
    })

    if (createError) {
      console.error('Error creating table:', createError)
    } else {
      console.log('✅ Admin notes table created successfully!')
      
      // Test the table
      const { data, error: testError } = await supabase
        .from('admin_notes')
        .select('count')
        .limit(1)

      if (testError) {
        console.error('❌ Error testing table:', testError)
      } else {
        console.log('✅ Table is working correctly!')
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

setupAdminNotes()
