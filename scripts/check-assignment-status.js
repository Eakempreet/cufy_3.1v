const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAssignments() {
  console.log('=== Checking current assignments ===');
  
  try {
    // Get the male user 'aman'
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('email', 'amansingj59@gmail.com')
      .single();
      
    if (userError || !user) {
      console.log('User not found:', userError);
      return;
    }
    
    console.log('User:', user);
    
    // Get all assignments for this user
    const { data: assignments, error: assignmentsError } = await supabase
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', user.id)
      .order('assigned_at', { ascending: false });
      
    if (assignmentsError) {
      console.log('Assignments error:', assignmentsError);
      return;
    }
      
    console.log('\n=== All assignments ===');
    assignments?.forEach((assignment, index) => {
      console.log(`Assignment ${index + 1}:`, {
        id: assignment.id,
        status: assignment.status,
        is_selected: assignment.is_selected,
        male_revealed: assignment.male_revealed,
        female_user_id: assignment.female_user_id,
        assigned_at: assignment.assigned_at
      });
    });
    
    // Check which are selected
    const selectedAssignments = assignments?.filter(a => a.is_selected === true);
    console.log('\n=== Selected assignments ===');
    console.log('Count:', selectedAssignments?.length || 0);
    selectedAssignments?.forEach(a => console.log('Selected:', { id: a.id, status: a.status }));
    
    // Check which are hidden
    const hiddenAssignments = assignments?.filter(a => a.status === 'hidden');
    console.log('\n=== Hidden assignments ===');
    console.log('Count:', hiddenAssignments?.length || 0);
    hiddenAssignments?.forEach(a => console.log('Hidden:', { id: a.id, status: a.status }));
    
    // Check which are revealed
    const revealedAssignments = assignments?.filter(a => a.status === 'revealed');
    console.log('\n=== Revealed assignments ===');
    console.log('Count:', revealedAssignments?.length || 0);
    revealedAssignments?.forEach(a => console.log('Revealed:', { id: a.id, status: a.status, is_selected: a.is_selected }));

    // Check assignments API logic
    console.log('\n=== API Logic Test ===');
    const { data: selectedCheck } = await supabase
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', user.id)
      .eq('is_selected', true)
      .single();
      
    if (selectedCheck) {
      console.log('API would return ONLY selected assignment:', selectedCheck.id);
    } else {
      console.log('API would return all non-hidden assignments');
      const nonHiddenAssignments = assignments?.filter(a => !['disengaged', 'hidden'].includes(a.status));
      console.log('Non-hidden count:', nonHiddenAssignments?.length || 0);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAssignments();
