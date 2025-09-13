import { supabaseAdmin } from '../lib/supabase'

async function checkAndFixDatabase() {
  console.log('🔍 Checking database schema...')
  
  try {
    // Check if profile_assignments table has the required columns
    const { data: columns, error } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profile_assignments')
    
    if (error) {
      console.error('❌ Error checking columns:', error)
      return
    }
    
    const columnNames = columns?.map(col => col.column_name) || []
    console.log('📊 Current profile_assignments columns:', columnNames)
    
    const requiredColumns = ['male_revealed', 'female_revealed', 'status', 'created_at']
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col))
    
    if (missingColumns.length > 0) {
      console.log('⚠️  Missing columns:', missingColumns)
      console.log('🔧 Please run the migration script: fix-profile-assignments.sql')
      console.log('📝 You can run it in the Supabase SQL editor')
    } else {
      console.log('✅ All required columns exist!')
    }
    
    // Test basic functionality
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, gender')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
    } else {
      console.log(`✅ Found ${users?.length || 0} users in database`)
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error)
  }
}

// Run the check
checkAndFixDatabase()
