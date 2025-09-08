const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingColumn() {
  console.log('🔧 Adding missing selected_male_user_id column to users table...');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./add-selected-male-user-id-column-fixed.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`\n📋 Executing statement ${i + 1}:`);
        console.log(statement.substring(0, 100) + '...');
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          
          // Try alternative method for ALTER TABLE
          if (statement.includes('ALTER TABLE')) {
            console.log('🔄 Trying alternative method for ALTER TABLE...');
            
            // For ALTER TABLE, we can try using the REST API
            const { error: altError } = await supabase
              .from('users')
              .select('selected_male_user_id')
              .limit(1);
            
            if (altError && altError.code === 'PGRST204') {
              console.log('✅ Column needs to be added - this is expected');
            } else {
              console.log('✅ Column might already exist or was added successfully');
            }
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          if (data) console.log('Result:', data);
        }
      }
    }
    
    // Test if the column exists by trying to query it
    console.log('\n🧪 Testing if column was added successfully...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, selected_male_user_id')
      .limit(1);
    
    if (testError) {
      if (testError.code === 'PGRST204') {
        console.log('❌ Column still missing - manual SQL execution may be needed');
        console.log('\n📝 MANUAL SQL TO RUN IN SUPABASE SQL EDITOR:');
        console.log('==========================================');
        console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS selected_male_user_id UUID REFERENCES users(id);');
        console.log('CREATE INDEX IF NOT EXISTS idx_users_selected_male_user_id ON users(selected_male_user_id);');
      } else {
        console.log('❌ Unexpected error:', testError);
      }
    } else {
      console.log('✅ SUCCESS! Column exists and is working');
      console.log('Sample data:', testData);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    
    console.log('\n📝 MANUAL SQL TO RUN IN SUPABASE SQL EDITOR:');
    console.log('==========================================');
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS selected_male_user_id UUID REFERENCES users(id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_users_selected_male_user_id ON users(selected_male_user_id);');
  }
}

addMissingColumn();
