const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ajkspxvjfrfpwxdkmhjo.supabase.co'
const supabaseServiceKey = 'sbp_7af6d9d4b7ff8bdbff24459361febe11a0c3d6d7'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkDatabase() {
  try {
    console.log('Connecting to Supabase...')
    
    // Get total count of users
    const { count: totalCount, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Error getting count:', countError)
      return
    }
    
    console.log(`Total users in database: ${totalCount}`)
    
    // Get first 10 users to check structure
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, gender, created_at, subscription_type, payment_confirmed')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (usersError) {
      console.error('Error getting users:', usersError)
      return
    }
    
    console.log('\nFirst 10 users:')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name} (${user.gender}) - ${user.email}`)
    })
    
    // Get gender breakdown
    const { data: genderBreakdown, error: genderError } = await supabase
      .from('users')
      .select('gender')
    
    if (!genderError && genderBreakdown) {
      const maleCount = genderBreakdown.filter(u => u.gender === 'male').length
      const femaleCount = genderBreakdown.filter(u => u.gender === 'female').length
      console.log(`\nGender breakdown: ${maleCount} males, ${femaleCount} females`)
    }
    
    // Check for any potential filtering issues
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, full_name, gender, created_at')
      .order('created_at', { ascending: false })
    
    if (!allError && allUsers) {
      console.log(`\nAll users fetched: ${allUsers.length}`)
      console.log('Sample of recent users:')
      allUsers.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. ${user.full_name} (${user.gender}) - ${user.created_at}`)
      })
    }
    
  } catch (error) {
    console.error('Database check failed:', error)
  }
}

checkDatabase()
