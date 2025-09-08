const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixAssignedCountColumn() {
  console.log('Fixing assigned_count column issue...')
  
  try {
    // Add the missing assigned_count column
    console.log('1. Adding assigned_count column...')
    const { error: alterError } = await supabase.rpc('execute_sql', {
      sql: 'ALTER TABLE female_profile_stats ADD COLUMN IF NOT EXISTS assigned_count integer DEFAULT 0;'
    })
    
    if (alterError) {
      console.log('Could not use RPC, trying direct approach...')
      
      // Try a different approach - just test if we can update the table
      const { error: updateError } = await supabase
        .from('female_profile_stats')
        .update({ assigned_count: 0 })
        .eq('id', 'dummy-test-id') // This will fail but tell us if column exists
      
      console.log('Update test result:', updateError)
    }
    
    // Test the assignment again
    console.log('2. Testing assignment creation after fix...')
    
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
        console.error('Assignment still failing:', assignError)
        
        // If it's still the same error, let's try to find and fix the trigger
        console.log('3. The issue is likely in a database trigger. Let me create a workaround...')
        
      } else {
        console.log('Assignment created successfully!', assignment)
        
        // Clean up
        await supabase
          .from('profile_assignments')
          .delete()
          .eq('id', assignment.id)
        
        console.log('Test assignment cleaned up. Issue is fixed!')
      }
    }
    
  } catch (error) {
    console.error('Fix error:', error)
  }
}

fixAssignedCountColumn()
