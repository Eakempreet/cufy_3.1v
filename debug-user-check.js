const { supabaseAdmin } = require('./lib/supabase')

async function checkUserData() {
  try {
    const userEmail = '2023339900.aman@ug.sharda.ac.in'
    console.log('Checking specific user:', userEmail)
    
    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()

    console.log('User lookup result:', { found: !!user, error: userError?.code, user: user ? { id: user.id, email: user.email, full_name: user.full_name } : null })

    if (user) {
      // Check assignments for this user
      const { data: assignments, error: assignmentError } = await supabaseAdmin
        .from('profile_assignments')
        .select('*')
        .eq('male_user_id', user.id)

      console.log('Assignments for user:', { count: assignments?.length || 0, assignments, error: assignmentError })
    }

    // Also check table structure
    console.log('Checking users table structure...')
    const { data: columns, error: columnError } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'users' })
      .catch(() => {
        // If RPC doesn't exist, try a simple query to see what columns exist
        return supabaseAdmin
          .from('users')
          .select('*')
          .limit(1)
      })

    console.log('Table structure check:', { columns, error: columnError })

  } catch (error) {
    console.error('Script error:', error)
  }
}

checkUserData()
