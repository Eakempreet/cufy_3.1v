const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xdhtrwaghahaigmbojotu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test connection by getting user count
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error);
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log(`📊 Total users in database: ${count}`);
    console.log(`📄 Retrieved ${data?.length || 0} user records`);
    
    if (data && data.length > 0) {
      console.log('👤 Sample user:', {
        id: data[0].id,
        email: data[0].email,
        name: data[0].name,
        created_at: data[0].created_at
      });
    }
    
  } catch (error) {
    console.error('💥 Connection test failed:', error);
  }
}

testConnection();
