// Test script to check storage upload functionality
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('=== STORAGE UPLOAD TEST ===')

// Test with anon client (what the frontend uses)
const anonClient = createClient(supabaseUrl, supabaseAnonKey)

// Test with service role client (for comparison)
const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

async function testStorageUpload() {
  console.log('\n=== TESTING STORAGE POLICIES ===')
  
  // Create a dummy file buffer
  const dummyFile = Buffer.from('test image content')
  const testFileName = `test_upload_${Date.now()}.txt`
  
  console.log('Testing upload to payment-proofs bucket with anon client...')
  try {
    const { data, error } = await anonClient.storage
      .from('payment-proofs')
      .upload(testFileName, dummyFile, {
        contentType: 'text/plain'
      })
    
    if (error) {
      console.error('❌ Anon client upload failed:', error.message)
      console.error('Error details:', error)
    } else {
      console.log('✅ Anon client upload successful')
      console.log('File path:', data.path)
      
      // Clean up test file
      await anonClient.storage.from('payment-proofs').remove([testFileName])
      console.log('✅ Test file cleaned up')
    }
  } catch (error) {
    console.error('❌ Upload test error:', error.message)
  }
  
  console.log('\nTesting upload to payment-proofs bucket with service client...')
  try {
    const { data, error } = await serviceClient.storage
      .from('payment-proofs')
      .upload(`service_${testFileName}`, dummyFile, {
        contentType: 'text/plain'
      })
    
    if (error) {
      console.error('❌ Service client upload failed:', error.message)
    } else {
      console.log('✅ Service client upload successful')
      
      // Clean up test file
      await serviceClient.storage.from('payment-proofs').remove([`service_${testFileName}`])
      console.log('✅ Service test file cleaned up')
    }
  } catch (error) {
    console.error('❌ Service upload test error:', error.message)
  }
}

async function checkAuthContext() {
  console.log('\n=== CHECKING AUTH CONTEXT ===')
  
  // Check current user context for anon client
  const { data: { user }, error } = await anonClient.auth.getUser()
  if (error) {
    console.log('⚠️  No authenticated user (expected for anon client)')
    console.log('This is likely the root cause of the RLS policy violation')
  } else {
    console.log('✅ Authenticated user found:', user.id)
  }
  
  // Get the session
  const { data: { session } } = await anonClient.auth.getSession()
  if (session) {
    console.log('✅ Active session found')
  } else {
    console.log('⚠️  No active session (users need to be authenticated for upload)')
  }
}

async function listStoragePolicies() {
  console.log('\n=== CHECKING STORAGE POLICIES WITH SQL ===')
  
  try {
    // Query storage policies directly
    const { data, error } = await serviceClient
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', 'payment-proofs')
    
    if (error) {
      console.log('⚠️  Cannot query storage policies table directly')
    } else {
      console.log('Storage policies for payment-proofs:')
      data.forEach(policy => {
        console.log(`  - ${policy.name}: ${policy.command}`)
      })
    }
  } catch (error) {
    console.log('⚠️  Storage policies query not available')
  }
}

// Run all tests
Promise.resolve()
  .then(() => checkAuthContext())
  .then(() => testStorageUpload())
  .then(() => listStoragePolicies())
  .then(() => {
    console.log('\n=== DIAGNOSIS ===')
    console.log('If anon client upload failed with RLS policy violation:')
    console.log('1. Users must be authenticated to upload files')
    console.log('2. Check that auth.uid() is not null in storage policies')
    console.log('3. Verify the payment upload component authenticates users first')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
