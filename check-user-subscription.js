// Script to check user subscription status
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserSubscription() {
  const userEmail = 'sumansingh5903@gmail.com' // From the console logs
  
  console.log('=== CHECKING USER SUBSCRIPTION STATUS ===')
  console.log('Email:', userEmail)
  
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, subscription_type, subscription_status, payment_proof_url')
      .eq('email', userEmail)
      .single()
    
    if (userError) {
      console.error('User lookup error:', userError)
      return
    }
    
    console.log('User data found:')
    console.log('- ID:', userData.id)
    console.log('- Email:', userData.email) 
    console.log('- Subscription Type:', userData.subscription_type)
    console.log('- Subscription Status:', userData.subscription_status)
    console.log('- Payment Proof URL:', userData.payment_proof_url)
    
    if (!userData.subscription_type) {
      console.log('\n❌ ISSUE FOUND: User has no subscription_type')
      console.log('This explains why the payment proof upload is failing')
      console.log('\n🔧 POTENTIAL FIXES:')
      console.log('1. User needs to select a subscription plan first')
      console.log('2. Or update the user record to set subscription_type to "premium"')
      
      // Offer to fix it
      console.log('\n🛠️  Attempting to set subscription_type to "premium"...')
      const { error: updateError } = await supabase
        .from('users')
        .update({ subscription_type: 'premium' })
        .eq('id', userData.id)
      
      if (updateError) {
        console.error('Failed to update user:', updateError)
      } else {
        console.log('✅ Successfully set subscription_type to "premium"')
        console.log('User should now be able to upload payment proof')
      }
    } else {
      console.log('✅ User has subscription_type set correctly')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkUserSubscription()
  .then(() => {
    console.log('\n=== CHECK COMPLETE ===')
    process.exit(0)
  })
  .catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
  })
