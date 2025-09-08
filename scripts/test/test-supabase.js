import { supabase, supabaseAdmin } from '../lib/supabase'

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Connection error:', error)
    } else {
      console.log('✅ Supabase connection successful!')
      console.log('Users table accessible')
    }
  } catch (err) {
    console.error('❌ Connection failed:', err)
  }
  
  try {
    // Test admin connection (server-side only)
    const { data: adminData, error: adminError } = await supabaseAdmin.from('users').select('count', { count: 'exact', head: true })
    
    if (adminError) {
      console.error('Admin connection error:', adminError)
    } else {
      console.log('✅ Supabase admin connection successful!')
    }
  } catch (err) {
    console.error('❌ Admin connection failed:', err)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testConnection()
}

export default testConnection
