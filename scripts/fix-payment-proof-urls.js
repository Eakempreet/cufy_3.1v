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

async function fixPaymentProofUrls() {
  console.log('🔧 Fixing Payment Proof URLs...')
  
  try {
    // Step 1: Fix users table - extract filename from full URLs
    console.log('\n1️⃣ Fixing users table URLs...')
    
    const { data: usersWithProofs, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, payment_proof_url')
      .not('payment_proof_url', 'is', null)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }

    let userFixCount = 0
    for (const user of usersWithProofs) {
      let correctedUrl = user.payment_proof_url
      
      // If it's a full URL, extract just the filename
      if (correctedUrl.startsWith('https://')) {
        // Extract filename from URL
        const urlParts = correctedUrl.split('/')
        const filename = urlParts[urlParts.length - 1]
        correctedUrl = filename
        
        console.log(`  📝 ${user.email}: ${user.payment_proof_url} → ${correctedUrl}`)
        
        // Update user record
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ payment_proof_url: correctedUrl })
          .eq('id', user.id)
        
        if (updateError) {
          console.error(`    ❌ Error updating user ${user.email}:`, updateError.message)
        } else {
          userFixCount++
          console.log(`    ✅ Updated user ${user.email}`)
        }
      }
    }
    
    console.log(`✅ Fixed ${userFixCount} user records`)

    // Step 2: Fix payments table
    console.log('\n2️⃣ Fixing payments table URLs...')
    
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('id, payment_proof_url, user_id')
      .not('payment_proof_url', 'is', null)

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return
    }

    let paymentFixCount = 0
    for (const payment of payments) {
      let correctedUrl = payment.payment_proof_url
      
      // If it's a full URL, extract just the filename
      if (correctedUrl.startsWith('https://')) {
        const urlParts = correctedUrl.split('/')
        const filename = urlParts[urlParts.length - 1]
        correctedUrl = filename
        
        console.log(`  📝 Payment ${payment.id}: ${payment.payment_proof_url} → ${correctedUrl}`)
        
        // Update payment record
        const { error: updateError } = await supabaseAdmin
          .from('payments')
          .update({ payment_proof_url: correctedUrl })
          .eq('id', payment.id)
        
        if (updateError) {
          console.error(`    ❌ Error updating payment ${payment.id}:`, updateError.message)
        } else {
          paymentFixCount++
          console.log(`    ✅ Updated payment ${payment.id}`)
        }
      }
    }
    
    console.log(`✅ Fixed ${paymentFixCount} payment records`)

    // Step 3: Test a few URLs after fix
    console.log('\n3️⃣ Testing fixed URLs...')
    
    const { data: testUsers, error: testError } = await supabaseAdmin
      .from('users')
      .select('email, payment_proof_url')
      .not('payment_proof_url', 'is', null)
      .limit(3)

    if (testError) {
      console.error('Error fetching test users:', testError)
    } else {
      for (const user of testUsers) {
        console.log(`\n🧪 Testing ${user.email}: ${user.payment_proof_url}`)
        
        // Try to access file
        const { data: fileData, error: fileError } = await supabaseAdmin.storage
          .from('payment-proofs')
          .download(user.payment_proof_url)
        
        if (fileError) {
          console.log(`  ❌ File not accessible: ${fileError.message}`)
          
          // Check if file exists in profile-photos bucket (old location)
          const { data: oldFileData, error: oldFileError } = await supabaseAdmin.storage
            .from('profile-photos')
            .download(`profile-photos/${user.payment_proof_url}`)
          
          if (!oldFileError) {
            console.log(`  📂 File found in old location, needs migration`)
          }
        } else {
          console.log(`  ✅ File accessible (${fileData.size} bytes)`)
        }
        
        // Generate correct public URL
        const { data: publicUrl } = supabaseAdmin.storage
          .from('payment-proofs')
          .getPublicUrl(user.payment_proof_url)
        
        console.log(`  📎 Public URL: ${publicUrl.publicUrl}`)
      }
    }

    console.log('\n🎉 Payment proof URL fix completed!')
    console.log(`📊 Summary: Fixed ${userFixCount} users and ${paymentFixCount} payments`)

  } catch (error) {
    console.error('❌ Fix error:', error)
  }
}

fixPaymentProofUrls()
