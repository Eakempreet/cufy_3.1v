const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
  console.log('=== Checking all users ===');
  
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, gender')
      .limit(10);
      
    if (usersError) {
      console.log('Users error:', usersError);
      return;
    }
      
    console.log('All users:');
    users?.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name} (${user.email}) - ${user.gender} - ID: ${user.id}`);
    });
    
    // Check specifically for male users
    const { data: maleUsers } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('gender', 'male');
      
    console.log('\n=== Male users ===');
    maleUsers?.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name} (${user.email}) - ID: ${user.id}`);
    });
    
    // If we have a male user, check their assignments
    if (maleUsers && maleUsers.length > 0) {
      const firstMaleUser = maleUsers[0];
      console.log(`\n=== Checking assignments for ${firstMaleUser.full_name} ===`);
      
      const { data: assignments } = await supabase
        .from('profile_assignments')
        .select('*')
        .eq('male_user_id', firstMaleUser.id)
        .order('assigned_at', { ascending: false });
        
      console.log('Assignment count:', assignments?.length || 0);
      assignments?.forEach((assignment, index) => {
        console.log(`Assignment ${index + 1}:`, {
          id: assignment.id,
          status: assignment.status,
          is_selected: assignment.is_selected,
          male_revealed: assignment.male_revealed,
          female_user_id: assignment.female_user_id
        });
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
