const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Fetching from API...');
    const response = await fetch('http://localhost:3000/api/admin/users');
    const data = await response.json();
    
    console.log('Total users from API:', data.users.length);
    console.log('Users with subscription_type premium:', data.users.filter(u => u.subscription_type === 'premium').length);
    console.log('Users with subscription_type basic:', data.users.filter(u => u.subscription_type === 'basic').length);
    console.log('Users with subscription_type null:', data.users.filter(u => u.subscription_type === null).length);
    
    console.log('\nSample subscription types:');
    data.users.slice(0, 10).forEach(u => {
      console.log(`${u.email}: ${u.subscription_type}`);
    });
    
    // Check specific premium users
    const premiumUsers = data.users.filter(u => u.subscription_type === 'premium');
    console.log('\nFirst 5 premium users:');
    premiumUsers.slice(0, 5).forEach(u => {
      console.log(`${u.email}: ${u.subscription_type} (${u.subscription_status})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
