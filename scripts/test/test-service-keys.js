require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Try different service role key formats
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKeys = [
  'sbp_7af6d9d4b7ff8bdbff24459361febe11a0c3d6d7', // Original format
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqa3NweHZqZnJmcHd4ZGttaGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzM5NzMzNywiZXhwIjoyMDQ4OTczMzM3fQ.bGdOEALKOCwFPFQWMOqkT5XKjGOqXdl_2Nn_-4d9uv0', // JWT format attempt
]

async function testServiceKeys() {
  console.log('🔑 Testing different service role key formats...\n')
  
  for (let i = 0; i < serviceKeys.length; i++) {
    const key = serviceKeys[i]
    console.log(`Testing key ${i + 1}: ${key.substring(0, 20)}...`)
    
    try {
      const client = createClient(supabaseUrl, key, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
      
      const { data, error } = await client.from('users').select('count').limit(1)
      
      if (error) {
        console.log(`❌ Key ${i + 1} failed:`, error.message)
      } else {
        console.log(`✅ Key ${i + 1} works!`)
        console.log('This is the correct service role key:', key)
        return key
      }
    } catch (err) {
      console.log(`❌ Key ${i + 1} exception:`, err.message)
    }
    console.log('')
  }
  
  console.log('❌ None of the keys work. Let me try to debug further...')
  
  // Test network connectivity
  console.log('\n🌐 Testing network connectivity...')
  try {
    const response = await fetch(supabaseUrl)
    console.log('✅ Supabase URL is reachable')
  } catch (err) {
    console.log('❌ Cannot reach Supabase URL:', err.message)
  }
}

testServiceKeys()
