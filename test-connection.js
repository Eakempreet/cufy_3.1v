// Test Supabase connection and debug issues
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Environment Variables Check:')
console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('- ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
console.log('- SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')
console.log('- NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing')
console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing')

async function testConnection() {
  try {
    console.log('\n🔌 Testing Supabase Connection...')
    
    // Test with service role key first
    if (supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      console.log('Testing admin connection...')
      const { data: users, error: usersError, count } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact' })
        .limit(5)

      if (usersError) {
        console.error('❌ Admin connection failed:', usersError)
      } else {
        console.log('✅ Admin connection successful!')
        console.log(`- Total users in database: ${count}`)
        console.log(`- Sample users fetched: ${users?.length || 0}`)
      }

      // Test system_settings table
      console.log('\nTesting system_settings table...')
      const { data: settings, error: settingsError } = await supabaseAdmin
        .from('system_settings')
        .select('*')

      if (settingsError) {
        console.error('❌ System settings failed:', settingsError)
      } else {
        console.log('✅ System settings successful!')
        console.log('- Settings found:', settings?.length || 0)
        if (settings && settings.length > 0) {
          settings.forEach(setting => {
            console.log(`  - ${setting.setting_key}: ${setting.setting_value}`)
          })
        }
      }
    }

    // Test with anon key
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
    
    console.log('\nTesting anon connection...')
    const { data: publicData, error: publicError } = await supabaseAnon
      .from('users')
      .select('count')
      .limit(1)

    if (publicError) {
      console.log('❌ Anon connection failed (expected due to RLS):', publicError.message)
    } else {
      console.log('✅ Anon connection successful!')
    }

  } catch (error) {
    console.error('💥 Connection test failed:', error)
  }
}

// Run the test
testConnection()
