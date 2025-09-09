const fs = require('fs')
const FormData = require('form-data')
const fetch = require('node-fetch')

async function testPaymentUploadAPI() {
  console.log('🧪 Testing Payment Proof Upload API...')
  
  try {
    // Create a simple test image file
    const testImageContent = Buffer.from('fake-image-data')
    const testImagePath = '/tmp/test-payment-proof.jpg'
    fs.writeFileSync(testImagePath, testImageContent)
    
    console.log('✅ Test image created')
    
    // Test the API endpoint
    console.log('🔗 Testing API endpoint availability...')
    
    const testResponse = await fetch('http://localhost:3000/api/user/payment-proof', {
      method: 'OPTIONS'
    })
    
    console.log(`📊 API Response Status: ${testResponse.status}`)
    
    // Clean up
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath)
    }
    
    console.log('🎉 Payment proof upload API test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testPaymentUploadAPI()
