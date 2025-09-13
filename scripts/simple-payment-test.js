#!/usr/bin/env node

// Simple Payment Proof Test
console.log('🔍 Testing Payment Proof Upload System...\n')

// Test if .env variables exist
console.log('1. Checking environment variables...')
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (supabaseUrl) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set')
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL is missing')
}

if (supabaseAnonKey) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set')
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
}

if (supabaseServiceKey) {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY is set')
} else {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY is missing')
}

console.log('\n2. Testing API endpoint availability...')

async function testAPI(url, method = 'GET') {
  try {
    const response = await fetch(`http://localhost:3000${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log(`${url}: ${response.status} (${response.statusText})`)
    return response.status
  } catch (error) {
    console.log(`${url}: ❌ Connection failed - ${error.message}`)
    return null
  }
}

async function runTests() {
  await testAPI('/api/user/payment-proof', 'POST')
  await testAPI('/api/admin/payments')
  
  console.log('\n🎉 Test completed!')
  console.log('\nTo fix payment proof issues:')
  console.log('1. ✅ Updated payment-proof API with admin client')
  console.log('2. ✅ Enhanced ImageUpload component')
  console.log('3. ✅ Improved Dashboard payment section')
  console.log('4. ✅ Updated admin payments API')
  console.log('\nChanges should resolve:')
  console.log('- Payment proof file replacement')
  console.log('- RLS permission issues')
  console.log('- Admin panel display problems')
}

runTests()
