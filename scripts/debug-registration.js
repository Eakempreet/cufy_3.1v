// Quick debug script to test registration status
// Run this in browser console on your Vercel site

async function debugRegistration() {
  try {
    console.log('🔍 Testing registration status API...')
    
    const response = await fetch('/api/registration-status')
    const data = await response.json()
    
    console.log('📊 API Response:', data)
    console.log('🔵 Boys Registration Enabled:', data.boys_registration_enabled)
    console.log('📝 Message:', data.boys_registration_message)
    console.log('🗃️ Raw Settings:', data.raw_settings)
    console.log('⚙️ Processed Settings:', data.processed_settings)
    
    // Test specific values
    if (data.boys_registration_enabled === false) {
      console.log('✅ Boys registration is correctly DISABLED')
    } else {
      console.log('❌ Boys registration is ENABLED (should be disabled)')
    }
    
    return data
  } catch (error) {
    console.error('❌ Error testing registration:', error)
  }
}

// Run the test
debugRegistration()
