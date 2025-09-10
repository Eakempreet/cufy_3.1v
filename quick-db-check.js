const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xdhtrwaghahigmbojotu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function quickDbCheck() {
  try {
    console.log('🔍 Quick Database Check for Dialog Issue')
    
    // Check male users
    const { data: maleUsers, error: maleError } = await supabase
      .from('users')
      .select('id, full_name, subscription_type, payment_confirmed')
      .eq('gender', 'male')
      .eq('payment_confirmed', true)
      .limit(3)
    
    if (maleError) {
      console.error('❌ Male users error:', maleError)
      return
    }
    
    console.log(`✅ Found ${maleUsers.length} paid male users`)
    
    // Check female users
    const { data: femaleUsers, error: femaleError } = await supabase
      .from('users')
      .select('id, full_name, age, university')
      .eq('gender', 'female')
      .limit(3)
    
    if (femaleError) {
      console.error('❌ Female users error:', femaleError)
      return
    }
    
    console.log(`✅ Found ${femaleUsers.length} female users`)
    
    if (maleUsers.length > 0 && femaleUsers.length > 0) {
      console.log('\n🎯 DATA IS AVAILABLE:')
      console.log(`Male user: ${maleUsers[0].full_name}`)
      console.log(`Female user: ${femaleUsers[0].full_name}`)
      console.log('\n🔧 The assign dialog issue is likely in the FRONTEND, not the database!')
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

quickDbCheck()
