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

async function debugPaymentUrls() {
  console.log('🔍 Debugging Payment Proof URLs...')
  
  try {
    // Check users with payment_proof_url
    const { data: usersWithProofs, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, payment_proof_url, subscription_type')
      .not('payment_proof_url', 'is', null)
      .limit(10)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }

    console.log(`📊 Found ${usersWithProofs?.length || 0} users with payment proofs:`)
    usersWithProofs?.forEach(user => {
      console.log(`  - ${user.email}: ${user.payment_proof_url}`)
    })

    // Check payments table
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('id, user_id, payment_proof_url, status, amount')
      .not('payment_proof_url', 'is', null)
      .limit(10)

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return
    }

    console.log(`\n💳 Found ${payments?.length || 0} payments with proofs:`)
    payments?.forEach(payment => {
      console.log(`  - Payment ${payment.id}: ${payment.payment_proof_url} (Status: ${payment.status})`)
    })

    // Check storage buckets
    console.log('\n🗂️  Checking storage buckets...')
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error fetching buckets:', bucketsError)
    } else {
      console.log('Available buckets:', buckets.map(b => b.name))
    }

    // List files in payment-proofs bucket
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from('payment-proofs')
      .list('', { limit: 10 })

    if (filesError) {
      console.error('Error listing payment-proofs files:', filesError)
    } else {
      console.log(`\n📁 Files in payment-proofs bucket (${files?.length || 0}):`)
      files?.forEach(file => {
        console.log(`  - ${file.name} (${file.metadata?.size} bytes)`)
      })
    }

    // Test accessing a payment proof URL
    if (usersWithProofs && usersWithProofs.length > 0) {
      const testUser = usersWithProofs[0]
      console.log(`\n🧪 Testing access to: ${testUser.payment_proof_url}`)
      
      // Try to get public URL
      const { data: publicUrl } = supabaseAdmin.storage
        .from('payment-proofs')
        .getPublicUrl(testUser.payment_proof_url)
      
      console.log(`📎 Public URL: ${publicUrl.publicUrl}`)
      
      // Try to check if file exists
      const { data: fileData, error: fileError } = await supabaseAdmin.storage
        .from('payment-proofs')
        .download(testUser.payment_proof_url)
      
      if (fileError) {
        console.log(`❌ File access error: ${fileError.message}`)
      } else {
        console.log(`✅ File exists and is accessible (${fileData.size} bytes)`)
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugPaymentUrls()
