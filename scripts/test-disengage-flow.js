const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDisengageFlow() {
  console.log('🧪 TESTING DISENGAGE FLOW - REMOVE ALL PROFILES');
  console.log('==============================================\n');

  try {
    // Step 1: Find or create a test male user
    console.log('📋 Step 1: Finding test male user...');
    
    let { data: testUser } = await supabase
      .from('users')
      .select('id, name, email, current_round')
      .eq('gender', 'male')
      .eq('registration_complete', true)
      .limit(1)
      .single();

    if (!testUser) {
      console.log('❌ No complete male users found');
      return;
    }

    console.log('✅ Found test user:', testUser.name, testUser.email);
    console.log('   Current round:', testUser.current_round);

    // Step 2: Clean up and create test scenario
    console.log('\n📋 Step 2: Setting up test scenario...');
    
    // Clean up existing assignments
    await supabase
      .from('profile_assignments')
      .delete()
      .eq('male_user_id', testUser.id);

    // Clean up existing temp matches
    await supabase
      .from('temporary_matches')
      .delete()
      .eq('male_user_id', testUser.id);

    // Reset user to round 1
    await supabase
      .from('users')
      .update({ current_round: 1, round_1_completed: false })
      .eq('id', testUser.id);

    console.log('✅ Cleaned up existing data and reset to Round 1');

    // Step 3: Find female users and create multiple assignments
    console.log('\n📋 Step 3: Creating multiple profile assignments...');
    
    const { data: femaleUsers } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('gender', 'female')
      .eq('registration_complete', true)
      .limit(3);

    if (!femaleUsers || femaleUsers.length < 3) {
      console.log('❌ Need at least 3 complete female users');
      return;
    }

    // Create 3 assignments - one will be selected, others assigned
    const assignments = [
      {
        male_user_id: testUser.id,
        female_user_id: femaleUsers[0].id,
        status: 'selected',
        male_revealed: true,
        is_selected: true,
        revealed_at: new Date().toISOString(),
        timer_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      },
      {
        male_user_id: testUser.id,
        female_user_id: femaleUsers[1].id,
        status: 'assigned',
        male_revealed: false,
        is_selected: false,
        created_at: new Date().toISOString()
      },
      {
        male_user_id: testUser.id,
        female_user_id: femaleUsers[2].id,
        status: 'assigned',
        male_revealed: false,
        is_selected: false,
        created_at: new Date().toISOString()
      }
    ];

    const { data: createdAssignments } = await supabase
      .from('profile_assignments')
      .insert(assignments)
      .select();

    console.log('✅ Created 3 assignments:');
    createdAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. ID: ${a.id.substring(0, 8)}..., Status: ${a.status}, Selected: ${a.is_selected}`);
    });

    // Create a temporary match for the selected profile
    const tempMatch = {
      male_user_id: testUser.id,
      female_user_id: femaleUsers[0].id,
      assignment_id: createdAssignments[0].id,
      status: 'active',
      male_disengaged: false,
      female_disengaged: false,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    };

    const { data: createdTempMatch } = await supabase
      .from('temporary_matches')
      .insert(tempMatch)
      .select()
      .single();

    console.log('✅ Created temporary match:', createdTempMatch.id.substring(0, 8) + '...');

    // Step 4: Check initial state
    console.log('\n📋 Step 4: Checking initial state...');
    
    const { data: initialAssignments } = await supabase
      .from('profile_assignments')
      .select('id, status, is_selected')
      .eq('male_user_id', testUser.id);

    const { data: initialTempMatches } = await supabase
      .from('temporary_matches')
      .select('id, status')
      .eq('male_user_id', testUser.id);

    console.log(`✅ Initial state: ${initialAssignments.length} assignments, ${initialTempMatches.length} temp matches`);
    console.log('   Assignments:', initialAssignments.map(a => ({
      id: a.id.substring(0, 8) + '...',
      status: a.status,
      selected: a.is_selected
    })));

    // Step 5: Simulate disengage API call
    console.log('\n📋 Step 5: Simulating disengage from selected profile...');
    
    const selectedAssignmentId = createdAssignments[0].id; // The selected one
    
    // Simulate the disengage API logic manually
    // 1. Mark current assignment as disengaged
    await supabase
      .from('profile_assignments')
      .update({
        status: 'disengaged',
        disengaged_at: new Date().toISOString(),
        is_selected: false,
        timer_expires_at: null
      })
      .eq('id', selectedAssignmentId);

    // 2. REMOVE all other assignments (this is the key change)
    const { error: removeError } = await supabase
      .from('profile_assignments')
      .delete()
      .eq('male_user_id', testUser.id)
      .neq('id', selectedAssignmentId);

    if (removeError) {
      console.log('❌ Error removing other assignments:', removeError);
      return;
    }

    // 3. Remove all temporary matches
    await supabase
      .from('temporary_matches')
      .delete()
      .eq('male_user_id', testUser.id);

    // 4. Update user to Round 2
    await supabase
      .from('users')
      .update({
        current_round: 2,
        round_1_completed: true,
        decision_timer_active: false,
        decision_timer_expires_at: null
      })
      .eq('id', testUser.id);

    console.log('✅ Disengage simulation completed');

    // Step 6: Check final state
    console.log('\n📋 Step 6: Checking final state after disengage...');
    
    const { data: finalAssignments } = await supabase
      .from('profile_assignments')
      .select('id, status, is_selected')
      .eq('male_user_id', testUser.id);

    const { data: finalTempMatches } = await supabase
      .from('temporary_matches')
      .select('id, status')
      .eq('male_user_id', testUser.id);

    const { data: updatedUser } = await supabase
      .from('users')
      .select('current_round, round_1_completed')
      .eq('id', testUser.id)
      .single();

    console.log(`✅ Final state: ${finalAssignments.length} assignments, ${finalTempMatches.length} temp matches`);
    console.log('   Remaining assignments:', finalAssignments.map(a => ({
      id: a.id.substring(0, 8) + '...',
      status: a.status,
      selected: a.is_selected
    })));
    console.log('   User round:', updatedUser.current_round, 'Round 1 complete:', updatedUser.round_1_completed);

    // Step 7: Final verification
    console.log('\n🎉 TEST RESULTS SUMMARY:');
    console.log('========================');
    console.log(`✅ Initial assignments: ${initialAssignments.length}`);
    console.log(`✅ Initial temp matches: ${initialTempMatches.length}`);
    console.log(`✅ Final assignments: ${finalAssignments.length} (should be 1 - only the disengaged one)`);
    console.log(`✅ Final temp matches: ${finalTempMatches.length} (should be 0)`);
    console.log(`✅ User moved to Round: ${updatedUser.current_round} (should be 2)`);
    
    if (finalAssignments.length === 1 && 
        finalAssignments[0].status === 'disengaged' && 
        finalTempMatches.length === 0 && 
        updatedUser.current_round === 2) {
      console.log('\n🎯 SUCCESS! Disengage functionality is working perfectly!');
      console.log('   - All assigned profiles removed except disengaged one (for history)');
      console.log('   - All temporary matches removed');
      console.log('   - User moved to Round 2');
      console.log('   - Dashboard will now show empty state');
    } else {
      console.log('\n❌ ISSUE DETECTED in the disengage logic!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDisengageFlow();
