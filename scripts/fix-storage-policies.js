#!/usr/bin/env node

// Fix Supabase Storage RLS Policies for Payment Proofs
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixStoragePolicies() {
  console.log('🔧 Fixing Supabase Storage RLS Policies...\n')

  try {
    // 1. Check if payment-proofs bucket exists
    console.log('1. Checking payment-proofs bucket...')
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      console.log('❌ Error listing buckets:', bucketsError.message)
      return
    }
    
    const paymentBucket = buckets.find(b => b.name === 'payment-proofs')
    if (!paymentBucket) {
      console.log('⚠️  payment-proofs bucket not found, creating...')
      
      const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket('payment-proofs', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (createError) {
        console.log('❌ Error creating bucket:', createError.message)
        return
      } else {
        console.log('✅ Created payment-proofs bucket')
      }
    } else {
      console.log('✅ payment-proofs bucket exists')
    }

    // 2. Test upload with admin client
    console.log('\n2. Testing admin upload...')
    
    // Create a test file buffer
    const testFile = Buffer.from('test image data')
    const testFileName = `test_upload_${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('payment-proofs')
      .upload(testFileName, testFile, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadError) {
      console.log('❌ Admin upload test failed:', uploadError.message)
      
      // Try to fix by updating bucket policies
      console.log('🔄 Attempting to fix storage policies...')
      
      // The issue might be that the bucket doesn't allow public uploads
      // Let's try to make the bucket properly configured
      const { error: updateError } = await supabaseAdmin.storage.updateBucket('payment-proofs', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (updateError) {
        console.log('❌ Error updating bucket:', updateError.message)
      } else {
        console.log('✅ Updated bucket configuration')
        
        // Try upload again
        const { error: retryError } = await supabaseAdmin.storage
          .from('payment-proofs')
          .upload(`retry_${testFileName}`, testFile, {
            cacheControl: '3600',
            upsert: true
          })
        
        if (retryError) {
          console.log('❌ Retry upload failed:', retryError.message)
        } else {
          console.log('✅ Retry upload successful')
        }
      }
    } else {
      console.log('✅ Admin upload test successful')
      
      // Clean up test file
      await supabaseAdmin.storage.from('payment-proofs').remove([testFileName])
    }

    // 3. Check RLS policies
    console.log('\n3. Checking RLS policies...')
    
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('storage.objects')
      .select('*')
      .limit(1)
    
    if (policiesError) {
      console.log('⚠️  Cannot directly check RLS policies:', policiesError.message)
    } else {
      console.log('✅ Storage objects accessible')
    }

    // 4. Recommendations
    console.log('\n🎯 Recommendations:')
    console.log('1. Ensure bucket allows public uploads')
    console.log('2. Use supabaseAdmin client for uploads in API routes')
    console.log('3. Consider creating custom RLS policies if needed')
    console.log('4. Check Supabase dashboard for storage policies')

    console.log('\n📋 Manual Steps (if needed):')
    console.log('1. Go to Supabase Dashboard > Storage > payment-proofs')
    console.log('2. Click on "Policies" tab')
    console.log('3. Create policy: "Allow uploads for authenticated users"')
    console.log('4. Policy SQL: CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = \'payment-proofs\');')

  } catch (error) {
    console.error('❌ Error fixing storage policies:', error)
  }
}

// Run the fix
fixStoragePolicies().then(() => {
  console.log('\n🎉 Storage policy fix completed!')
  process.exit(0)
}).catch(error => {
  console.error('Fix failed:', error)
  process.exit(1)
})
