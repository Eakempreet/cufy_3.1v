require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Environment check:', { 
  hasUrl: !!supabaseUrl, 
  hasKey: !!supabaseServiceKey,
  url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing'
})

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkUser() {
  const userEmail = '2023339900.aman@ug.sharda.ac.in'
  console.log('Checking user:', userEmail)
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, gender, current_round')
      .eq('email', userEmail)
      .single()
    
    console.log('Result:', { data, error })
    
    if (data) {
      // Check assignments
      const { data: assignments, error: assignError } = await supabase
        .from('profile_assignments')
        .select('*')
        .eq('male_user_id', data.id)
      
      console.log('Assignments:', { count: assignments?.length || 0, error: assignError })
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

checkUser()
