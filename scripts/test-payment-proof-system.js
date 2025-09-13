#!/usr/bin/env node

// Test Payment Proof Upload System
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testPaymentProofSystem() {
  console.log('🔍 Testing Payment Proof Upload System...\n')

  try {
    // Test 1: Check payment-proofs bucket exists and permissions
    console.log('1. Testing payment-proofs storage bucket...')
    
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      console.log('❌ Error listing buckets:', bucketsError.message)
      return
    }
    
    const paymentProofsBucket = buckets.find(b => b.name === 'payment-proofs')
    if (paymentProofsBucket) {
      console.log('✅ payment-proofs bucket exists')
    } else {
      console.log('❌ payment-proofs bucket not found')
      console.log('Available buckets:', buckets.map(b => b.name))
      return
    }

    // Test 2: Check users with payment proofs
    console.log('\n2. Checking users with payment proofs...')
    
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, payment_proof_url, payment_confirmed, subscription_type')
      .eq('gender', 'male')
      .not('payment_proof_url', 'is', null)
      .limit(5)

    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message)
      return
    }

    console.log(`✅ Found ${users.length} users with payment proofs`)
    users.forEach(user => {
      console.log(`   - ${user.full_name}: ${user.payment_proof_url} (${user.payment_confirmed ? 'Confirmed' : 'Pending'})`)
    })

    // Test 3: Check payment records
    console.log('\n3. Checking payment records...')
    
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('id, user_id, amount, status, payment_proof_url')
      .limit(5)

    if (paymentsError) {
      console.log('❌ Error fetching payments:', paymentsError.message)
    } else {
      console.log(`✅ Found ${payments.length} payment records`)
      payments.forEach(payment => {
        console.log(`   - User ${payment.user_id}: ₹${payment.amount} (${payment.status}) - Proof: ${payment.payment_proof_url || 'None'}`)
      })
    }

    // Test 4: Test file accessibility
    if (users.length > 0) {
      console.log('\n4. Testing payment proof file accessibility...')
      
      const testUser = users[0]
      if (testUser.payment_proof_url) {
        try {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from('payment-proofs')
            .getPublicUrl(testUser.payment_proof_url)
          
          console.log(`✅ Public URL generated: ${publicUrlData.publicUrl}`)
          
          // Test if file exists
          const { data: fileData, error: fileError } = await supabaseAdmin.storage
            .from('payment-proofs')
            .list('', {
              search: testUser.payment_proof_url
            })
          
          if (fileError) {
            console.log('❌ Error listing files:', fileError.message)
          } else if (fileData.length > 0) {
            console.log('✅ Payment proof file exists in storage')
          } else {
            console.log('⚠️  Payment proof file not found in storage')
          }
        } catch (error) {
          console.log('❌ Error testing file accessibility:', error.message)
        }
      }
    }

    // Test 5: Check RLS policies
    console.log('\n5. Testing RLS policies with regular client...')
    
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('id, payment_proof_url')
      .eq('gender', 'male')
      .not('payment_proof_url', 'is', null)
      .limit(1)

    if (publicError) {
      console.log('⚠️  Regular client cannot access user data (RLS working):', publicError.message)
    } else {
      console.log(`⚠️  Regular client can access ${publicUsers.length} users (RLS may be too permissive)`)
    }

    console.log('\n🎉 Payment proof system test completed!')
    console.log('\nRecommendations:')
    console.log('- Ensure payment-proofs bucket has proper RLS policies')
    console.log('- Admin panel should use supabaseAdmin client for data access')
    console.log('- Payment proof URLs should be accessible via getPublicUrl()')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testPaymentProofSystem().then(() => {
  process.exit(0)
}).catch(error => {
  console.error('Test error:', error)
  process.exit(1)
})
