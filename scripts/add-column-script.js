const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addSelectedMaleUserIdColumn() {
  console.log('🔧 Adding selected_male_user_id column to users table...');
  
  try {
    // First, let's try to create the column using raw SQL query
    const { data, error } = await supabase
      .rpc('sql', {
        query: `
          -- Add selected_male_user_id column to users table
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS selected_male_user_id UUID;
          
          -- Add comment to explain the column
          COMMENT ON COLUMN users.selected_male_user_id IS 'Stores the ID of the male user selected by this female user in the admin panel';
          
          -- Create index for performance
          CREATE INDEX IF NOT EXISTS idx_users_selected_male_user_id ON users(selected_male_user_id);
        `
      });

    if (error) {
      console.log('❌ RPC failed, trying alternative approach...');
      console.log('Error:', error);
      
      // Alternative: Try using the Supabase SQL editor approach
      // We'll need to manually execute this in the Supabase dashboard
      console.log('📋 Please execute this SQL in your Supabase SQL editor:');
      console.log(`
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS selected_male_user_id UUID;

COMMENT ON COLUMN users.selected_male_user_id IS 'Stores the ID of the male user selected by this female user in the admin panel';

CREATE INDEX IF NOT EXISTS idx_users_selected_male_user_id ON users(selected_male_user_id);
      `);
      
      return;
    }
    
    console.log('✅ Column added successfully!');
    console.log('Result:', data);
    
    // Test the column by selecting from it
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, email, selected_male_user_id')
      .limit(1);
      
    if (testError) {
      console.log('❌ Test failed:', testError);
    } else {
      console.log('✅ Column is working! Sample:', testData);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the function
addSelectedMaleUserIdColumn();
