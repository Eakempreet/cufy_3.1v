require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migratePaymentProofFiles() {
  console.log('📦 Migrating Payment Proof Files...')
  
  try {
    // Step 1: Get all users with payment proof URLs that need migration
    console.log('\n1️⃣ Finding files that need migration...')
    
    const { data: usersWithProofs, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, payment_proof_url')
      .not('payment_proof_url', 'is', null)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }

    console.log(`📊 Found ${usersWithProofs.length} users with payment proofs`)

    let migrationCount = 0
    let alreadyExistsCount = 0
    let errorCount = 0

    for (const user of usersWithProofs) {
      const filename = user.payment_proof_url
      
      // Skip if it's already the correct format (payment_proof_xxx)
      if (filename.startsWith('payment_proof_')) {
        console.log(`  ✅ ${user.email}: ${filename} (already correct format)`)
        alreadyExistsCount++
        continue
      }

      console.log(`\n🔄 Migrating ${user.email}: ${filename}`)

      try {
        // Step 1: Check if file exists in payment-proofs bucket
        const { data: existingFile, error: checkError } = await supabaseAdmin.storage
          .from('payment-proofs')
          .download(filename)

        if (!checkError && existingFile) {
          console.log(`  ✅ File already exists in payment-proofs bucket`)
          alreadyExistsCount++
          continue
        }

        // Step 2: Try to download from profile-photos bucket
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
          .from('profile-photos')
          .download(`profile-photos/${filename}`)

        if (downloadError || !fileData) {
          console.log(`  ❌ File not found in profile-photos: ${downloadError?.message || 'No data'}`)
          errorCount++
          continue
        }

        console.log(`  📥 Downloaded from profile-photos (${fileData.size} bytes)`)

        // Step 3: Upload to payment-proofs bucket
        const { error: uploadError } = await supabaseAdmin.storage
          .from('payment-proofs')
          .upload(filename, fileData, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.log(`  ❌ Upload failed: ${uploadError.message}`)
          errorCount++
          continue
        }

        console.log(`  ✅ Successfully migrated to payment-proofs bucket`)
        migrationCount++

        // Step 4: Verify the upload worked
        const { data: verifyData, error: verifyError } = await supabaseAdmin.storage
          .from('payment-proofs')
          .download(filename)

        if (verifyError || !verifyData) {
          console.log(`  ⚠️  Warning: Could not verify upload`)
        } else {
          console.log(`  ✅ Upload verified (${verifyData.size} bytes)`)
        }

        // Optional: Delete from old location (commented out for safety)
        // const { error: deleteError } = await supabaseAdmin.storage
        //   .from('profile-photos')
        //   .remove([`profile-photos/${filename}`])
        // 
        // if (!deleteError) {
        //   console.log(`  🗑️  Deleted from old location`)
        // }

      } catch (error) {
        console.log(`  ❌ Migration error: ${error.message}`)
        errorCount++
      }
    }

    console.log('\n📋 Migration Summary:')
    console.log(`✅ Successfully migrated: ${migrationCount} files`)
    console.log(`📋 Already in correct location: ${alreadyExistsCount} files`)
    console.log(`❌ Migration errors: ${errorCount} files`)

    // Step 2: Test a few migrated files
    console.log('\n2️⃣ Testing migrated files...')
    
    const testUsers = usersWithProofs.slice(0, 3)
    for (const user of testUsers) {
      const filename = user.payment_proof_url
      console.log(`\n🧪 Testing ${user.email}: ${filename}`)
      
      // Test access
      const { data: fileData, error: fileError } = await supabaseAdmin.storage
        .from('payment-proofs')
        .download(filename)
      
      if (fileError) {
        console.log(`  ❌ File not accessible: ${fileError.message}`)
      } else {
        console.log(`  ✅ File accessible (${fileData.size} bytes)`)
      }
      
      // Generate public URL
      const { data: publicUrl } = supabaseAdmin.storage
        .from('payment-proofs')
        .getPublicUrl(filename)
      
      console.log(`  📎 Public URL: ${publicUrl.publicUrl}`)
    }

    console.log('\n🎉 Payment proof file migration completed!')

  } catch (error) {
    console.error('❌ Migration error:', error)
  }
}

migratePaymentProofFiles()
