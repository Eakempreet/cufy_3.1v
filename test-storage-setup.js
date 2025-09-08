// Test script to check database and storage configuration
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('=== SUPABASE CONFIGURATION TEST ===')
console.log('URL:', supabaseUrl)
console.log('Service Role Key:', supabaseKey ? 'Present' : 'Missing')
console.log('Anon Key:', anonKey ? 'Present' : 'Missing')
console.log('')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('=== TESTING DATABASE CONNECTION ===')
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    } else {
      console.log('✅ Database connection successful')
    }
    
    // Test storage buckets
    console.log('\n=== TESTING STORAGE BUCKETS ===')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) {
      console.error('❌ Storage buckets check failed:', bucketsError.message)
      return false
    }
    
    console.log('Available buckets:')
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.id} (public: ${bucket.public})`)
    })
    
    // Check specific buckets
    const requiredBuckets = ['profile-photos', 'payment-proofs']
    const existingBuckets = buckets.map(b => b.id)
    
    console.log('\n=== BUCKET VERIFICATION ===')
    requiredBuckets.forEach(bucketName => {
      if (existingBuckets.includes(bucketName)) {
        console.log(`✅ ${bucketName} bucket exists`)
      } else {
        console.log(`❌ ${bucketName} bucket missing`)
      }
    })
    
    // Test storage policies
    console.log('\n=== TESTING STORAGE POLICIES ===')
    try {
      const { data: policies, error: policiesError } = await supabase.rpc('get_storage_policies')
      if (policiesError) {
        console.log('⚠️  Cannot retrieve storage policies (custom function may not exist)')
      } else {
        console.log('✅ Storage policies retrieved')
      }
    } catch (e) {
      console.log('⚠️  Storage policies check skipped (requires custom function)')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

async function createMissingBuckets() {
  console.log('\n=== CREATING MISSING BUCKETS ===')
  
  const { data: buckets } = await supabase.storage.listBuckets()
  const existingBuckets = buckets.map(b => b.id)
  
  if (!existingBuckets.includes('payment-proofs')) {
    console.log('Creating payment-proofs bucket...')
    const { error } = await supabase.storage.createBucket('payment-proofs', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    })
    
    if (error) {
      console.error('❌ Failed to create payment-proofs bucket:', error.message)
    } else {
      console.log('✅ payment-proofs bucket created')
    }
  }
}

// Run tests
testConnection()
  .then(success => {
    if (success) {
      return createMissingBuckets()
    }
  })
  .then(() => {
    console.log('\n=== TEST COMPLETE ===')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  })
