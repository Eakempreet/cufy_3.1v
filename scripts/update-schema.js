const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xdhtrwaghahigmbojotu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addMissingColumns() {
  console.log('Adding missing columns...')
  
  try {
    // Add revealed_at column to temporary_matches table
    const { error: error1 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE temporary_matches ADD COLUMN IF NOT EXISTS revealed_at TIMESTAMPTZ;'
    })
    if (error1) console.log('Error adding revealed_at:', error1)
    else console.log('✓ Added revealed_at column to temporary_matches')

    // Add assigned_at column to profile_assignments table  
    const { error: error2 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE profile_assignments ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();'
    })
    if (error2) console.log('Error adding assigned_at:', error2)
    else console.log('✓ Added assigned_at column to profile_assignments')

    // Add matched_at column to permanent_matches table
    const { error: error3 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE permanent_matches ADD COLUMN IF NOT EXISTS matched_at TIMESTAMPTZ DEFAULT NOW();'
    })
    if (error3) console.log('Error adding matched_at:', error3)
    else console.log('✓ Added matched_at column to permanent_matches')

    console.log('Schema update completed!')
    
  } catch (error) {
    console.error('Error updating schema:', error)
  }
}

addMissingColumns()
