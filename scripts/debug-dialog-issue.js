const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xdhtrwaghahigmbojotu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugDialogIssue() {
  try {
    console.log('🔍 Debugging Dialog Issue - Checking Database Structure')
    
    // 1. Check male users count
    console.log('\n📊 Checking Male Users:')
    const { data: maleUsers, error: maleError } = await supabase
      .from('users')
      .select('*')
      .eq('gender', 'male')
      .eq('payment_confirmed', true)
      .limit(5)
    
    if (maleError) {
      console.error('❌ Error fetching male users:', maleError)
    } else {
      console.log(`✅ Found ${maleUsers.length} paid male users`)
      if (maleUsers.length > 0) {
        console.log('📝 Sample male user:', {
          id: maleUsers[0].id,
          name: maleUsers[0].full_name,
          subscription_type: maleUsers[0].subscription_type,
          payment_confirmed: maleUsers[0].payment_confirmed
        })
      }
    }
    
    // 2. Check female users count
    console.log('\n👩 Checking Female Users:')
    const { data: femaleUsers, error: femaleError } = await supabase
      .from('users')
      .select('*')
      .eq('gender', 'female')
      .limit(5)
    
    if (femaleError) {
      console.error('❌ Error fetching female users:', femaleError)
    } else {
      console.log(`✅ Found ${femaleUsers.length} female users`)
      if (femaleUsers.length > 0) {
        console.log('📝 Sample female user:', {
          id: femaleUsers[0].id,
          name: femaleUsers[0].full_name,
          age: femaleUsers[0].age,
          university: femaleUsers[0].university
        })
      }
    }
    
    // 3. Check assignments
    console.log('\n📋 Checking Assignments:')
    const { data: assignments, error: assignmentError } = await supabase
      .from('assignments')
      .select('*')
      .limit(3)
    
    if (assignmentError) {
      console.error('❌ Error fetching assignments:', assignmentError)
    } else {
      console.log(`✅ Found ${assignments.length} assignments`)
      if (assignments.length > 0) {
        console.log('📝 Sample assignment:', assignments[0])
      }
    }
    
    // 4. Test a specific male user for assignment dialog
    if (maleUsers && maleUsers.length > 0) {
      const testUser = maleUsers[0]
      console.log(`\n🔧 Testing Assignment Dialog for User: ${testUser.full_name}`)
      
      // Get user's current assignments
      const { data: userAssignments, error: userAssignError } = await supabase
        .from('assignments')
        .select(`
          *,
          female_user:users!assignments_female_user_id_fkey(*)
        `)
        .eq('male_user_id', testUser.id)
      
      if (userAssignError) {
        console.error('❌ Error fetching user assignments:', userAssignError)
      } else {
        console.log(`✅ User has ${userAssignments.length} assignments`)
        
        // Get available female users (not assigned to this user)
        const assignedFemaleIds = userAssignments.map(a => a.female_user_id)
        
        const { data: availableFemales, error: availableError } = await supabase
          .from('users')
          .select('*')
          .eq('gender', 'female')
          .not('id', 'in', `(${assignedFemaleIds.join(',') || 'null'})`)
          .limit(5)
        
        if (availableError) {
          console.error('❌ Error fetching available females:', availableError)
        } else {
          console.log(`✅ Found ${availableFemales.length} available female users for assignment`)
          
          if (availableFemales.length > 0) {
            console.log('📝 Sample available female:', {
              id: availableFemales[0].id,
              name: availableFemales[0].full_name,
              age: availableFemales[0].age,
              university: availableFemales[0].university
            })
            
            console.log('\n🎯 RECOMMENDATION: The assign dialog should work!')
            console.log('✅ Male users exist')
            console.log('✅ Female users exist') 
            console.log('✅ Available females for assignment exist')
            console.log('\n🔧 The issue might be in the frontend JavaScript/React code.')
          } else {
            console.log('\n⚠️  WARNING: No available female users for assignment!')
            console.log('🔧 Need to check if all females are already assigned to this user.')
          }
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

debugDialogIssue()
