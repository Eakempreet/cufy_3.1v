const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function examineTableStructure() {
  console.log('Examining female_profile_stats table structure...')
  
  try {
    // Try to get the table structure
    const { data: tableData, error } = await supabase
      .from('female_profile_stats')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error accessing table:', error)
    } else {
      console.log('Table exists. Sample data:', tableData)
      
      if (tableData && tableData.length > 0) {
        console.log('Columns in the table:', Object.keys(tableData[0]))
      } else {
        console.log('Table is empty')
      }
    }
    
    // Let's also check if there are any triggers
    console.log('\nChecking for related database objects...')
    
    // Check profile_assignments table to see what might trigger this
    const { data: assignmentSample } = await supabase
      .from('profile_assignments')
      .select('*')
      .limit(1)
    
    if (assignmentSample && assignmentSample.length > 0) {
      console.log('Profile assignments columns:', Object.keys(assignmentSample[0]))
    }
    
  } catch (error) {
    console.error('Examination error:', error)
  }
}

examineTableStructure()
