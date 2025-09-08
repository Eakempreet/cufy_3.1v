const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xdhtrwaghahigmbojotu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Connection error:', error);
      return;
    }
    
    console.log('✅ Connection successful!');
    
    // Get actual user count
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total users in database: ${count}`);
    
    // Get a sample of users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('Users fetch error:', usersError);
      return;
    }
    
    console.log(`📝 Sample users fetched: ${users.length}`);
    console.log('First user structure:', users[0] ? Object.keys(users[0]) : 'No users found');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();
