const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSpecificUsers() {
  console.log('=== Checking users with assignments ===');
  
  try {
    // Get all assignments first to see which male users have assignments
    const { data: allAssignments, error: assignmentsError } = await supabase
      .from('profile_assignments')
      .select('male_user_id, status, is_selected')
      .limit(20);
      
    if (assignmentsError) {
      console.log('Assignments error:', assignmentsError);
      return;
    }
    
    console.log('Total assignments found:', allAssignments?.length || 0);
    
    if (allAssignments && allAssignments.length > 0) {
      // Group by male user ID
      const userAssignments = {};
      allAssignments.forEach(assignment => {
        const userId = assignment.male_user_id;
        if (!userAssignments[userId]) {
          userAssignments[userId] = [];
        }
        userAssignments[userId].push(assignment);
      });
      
      console.log('\n=== Users with assignments ===');
      for (const [userId, assignments] of Object.entries(userAssignments)) {
        console.log(`User ${userId}: ${assignments.length} assignments`);
        assignments.forEach((assignment, index) => {
          console.log(`  ${index + 1}. Status: ${assignment.status}, Selected: ${assignment.is_selected}`);
        });
      }
      
      // Get details for the first user with assignments
      const firstUserId = Object.keys(userAssignments)[0];
      console.log(`\n=== Checking user ${firstUserId} in detail ===`);
      
      const { data: userDetails } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', firstUserId)
        .single();
        
      if (userDetails) {
        console.log('User details:', userDetails);
        
        // Get full assignment details for this user
        const { data: fullAssignments } = await supabase
          .from('profile_assignments')
          .select('*')
          .eq('male_user_id', firstUserId)
          .order('assigned_at', { ascending: false });
          
        console.log('\nFull assignments:');
        fullAssignments?.forEach((assignment, index) => {
          console.log(`Assignment ${index + 1}:`, {
            id: assignment.id,
            status: assignment.status,
            is_selected: assignment.is_selected,
            male_revealed: assignment.male_revealed,
            female_user_id: assignment.female_user_id,
            assigned_at: assignment.assigned_at,
            timer_expires_at: assignment.timer_expires_at
          });
        });
        
        // Test API logic for this user
        console.log('\n=== Testing API logic ===');
        const { data: selectedCheck } = await supabase
          .from('profile_assignments')
          .select('*')
          .eq('male_user_id', firstUserId)
          .eq('is_selected', true)
          .single();
          
        if (selectedCheck) {
          console.log('✅ User has selected profile - API should return ONLY:', selectedCheck.id);
        } else {
          console.log('❌ No selected profile found - API should return all non-hidden assignments');
          const nonHiddenAssignments = fullAssignments?.filter(a => !['disengaged', 'hidden'].includes(a.status));
          console.log('Non-hidden assignments count:', nonHiddenAssignments?.length || 0);
          nonHiddenAssignments?.forEach(a => {
            console.log(`  - ${a.id} (status: ${a.status})`);
          });
        }
      }
    } else {
      console.log('No assignments found in the database');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSpecificUsers();
