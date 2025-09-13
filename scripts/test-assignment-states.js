const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xdhtrwaghahigmbojotu.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAssignmentStates() {
  console.log('🔍 Checking Assignment States...\n');

  try {
    // Get the test user (aman with assignments)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('id', 'be865f75-7214-4683-9747-1a17ef49c364')
      .single();

    if (userError || !user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`👤 Test User: ${user.full_name} (${user.email})`);

    // Get all assignments for this user
    const { data: assignments, error: assignmentError } = await supabase
      .from('profile_assignments')
      .select(`
        id,
        status,
        is_selected,
        selected_at,
        timer_expires_at,
        female_user_id,
        users!female_user_id(full_name)
      `)
      .eq('male_user_id', user.id)
      .order('created_at', { ascending: true });

    if (assignmentError) {
      console.log('❌ Error fetching assignments:', assignmentError.message);
      return;
    }

    console.log(`\n📋 Found ${assignments?.length || 0} assignments:`);
    
    if (assignments && assignments.length > 0) {
      assignments.forEach((assignment, index) => {
        const femaleName = assignment.users?.full_name || 'Unknown';
        const status = assignment.status;
        const isSelected = assignment.is_selected ? '✅ SELECTED' : '⬜ NOT SELECTED';
        const timer = assignment.timer_expires_at ? 
          `⏰ Expires: ${new Date(assignment.timer_expires_at).toLocaleString()}` : 
          '⏰ No timer';
        
        console.log(`\n${index + 1}. ${femaleName}`);
        console.log(`   Status: ${status.toUpperCase()}`);
        console.log(`   Selected: ${isSelected}`);
        console.log(`   Timer: ${timer}`);
        console.log(`   Assignment ID: ${assignment.id}`);
      });

      // Summary
      const selectedCount = assignments.filter(a => a.status === 'selected').length;
      const hiddenCount = assignments.filter(a => a.status === 'hidden').length;
      const assignedCount = assignments.filter(a => a.status === 'assigned').length;
      const revealedCount = assignments.filter(a => a.status === 'revealed').length;

      console.log(`\n📊 Summary:`);
      console.log(`   Selected: ${selectedCount}`);
      console.log(`   Hidden: ${hiddenCount}`);
      console.log(`   Assigned: ${assignedCount}`);
      console.log(`   Revealed: ${revealedCount}`);

      if (selectedCount === 1 && hiddenCount > 0) {
        console.log(`\n✅ GOOD: One profile selected, others hidden`);
      } else if (selectedCount === 0 && assignedCount > 1) {
        console.log(`\n⚠️  ISSUE: Multiple profiles assigned, none selected yet`);
      } else if (selectedCount === 0 && hiddenCount > 0) {
        console.log(`\n⚠️  ISSUE: Profiles hidden but none selected`);
      } else if (selectedCount > 1) {
        console.log(`\n❌ ERROR: Multiple profiles selected (should be max 1)`);
      }
    } else {
      console.log('📭 No assignments found for this user');
    }

    // Check temporary matches
    const { data: tempMatches, error: tempError } = await supabase
      .from('temporary_matches')
      .select(`
        id,
        status,
        male_user_id,
        female_user_id,
        expires_at,
        users!female_user_id(full_name)
      `)
      .eq('male_user_id', user.id);

    if (!tempError && tempMatches && tempMatches.length > 0) {
      console.log(`\n💕 Temporary Matches: ${tempMatches.length}`);
      tempMatches.forEach((match, index) => {
        const femaleName = match.users?.full_name || 'Unknown';
        const expires = new Date(match.expires_at).toLocaleString();
        console.log(`   ${index + 1}. ${femaleName} - Expires: ${expires}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testAssignmentStates();
}

module.exports = { testAssignmentStates };
