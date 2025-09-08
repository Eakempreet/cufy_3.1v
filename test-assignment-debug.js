const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testAssignmentIssue() {
  console.log('Testing assignment issue...')
  
  try {
    // First, let's check what tables exist
    console.log('\n1. Checking available tables...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema_info')
      .select()
    
    if (tablesError) {
      console.log('Cannot get schema info, trying direct table check...')
      
      // Check if profile_assignments table exists and its structure
      const { data: assignmentCheck, error: assignmentError } = await supabase
        .from('profile_assignments')
        .select('*')
        .limit(1)
      
      if (assignmentError) {
        console.error('Profile assignments table error:', assignmentError)
      } else {
        console.log('Profile assignments table exists')
      }
      
      // Check if there's a female_profile_stats table
      const { data: statsCheck, error: statsError } = await supabase
        .from('female_profile_stats')
        .select('*')
        .limit(1)
      
      if (statsError) {
        console.error('Female profile stats table error:', statsError)
      } else {
        console.log('Female profile stats table exists')
      }
    }
    
    // Try to see what happens when we insert a profile assignment
    console.log('\n2. Testing assignment creation...')
    
    // Get some test user IDs first
    const { data: maleUsers } = await supabase
      .from('users')
      .select('id')
      .eq('gender', 'male')
      .limit(1)
    
    const { data: femaleUsers } = await supabase
      .from('users')
      .select('id')
      .eq('gender', 'female')
      .limit(1)
    
    if (maleUsers && maleUsers.length > 0 && femaleUsers && femaleUsers.length > 0) {
      const testMaleId = maleUsers[0].id
      const testFemaleId = femaleUsers[0].id
      
      console.log(`Testing assignment: Male ${testMaleId} -> Female ${testFemaleId}`)
      
      // Try the assignment
      const { data: assignment, error: assignError } = await supabase
        .from('profile_assignments')
        .insert({
          male_user_id: testMaleId,
          female_user_id: testFemaleId,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (assignError) {
        console.error('Assignment creation failed:', assignError)
      } else {
        console.log('Assignment created successfully:', assignment)
        
        // Clean up the test assignment
        await supabase
          .from('profile_assignments')
          .delete()
          .eq('id', assignment.id)
        
        console.log('Test assignment cleaned up')
      }
    } else {
      console.log('No test users available')
    }
    
  } catch (error) {
    console.error('Test error:', error)
  }
}

testAssignmentIssue()
