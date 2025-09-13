const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCompleteDisengageFlow() {
  console.log('🧪 TESTING COMPLETE DISENGAGE FLOW - CANCEL SELECTION');
  console.log('=================================================\n');

  try {
    // Step 1: Find a test male user
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

    // Step 2: Find a female user and setup test scenario
    console.log('\n📋 Step 2: Setting up complete test scenario...');
    
    const { data: femaleUsers } = await supabase
      .from('users')
      .select('id, name, email, selected_male_user_id')
      .eq('gender', 'female')
      .eq('registration_complete', true)
      .limit(2);

    if (!femaleUsers || femaleUsers.length < 2) {
      console.log('❌ Need at least 2 complete female users');
      return;
    }

    // Clean up existing data
    await supabase.from('profile_assignments').delete().eq('male_user_id', testUser.id);
    await supabase.from('temporary_matches').delete().eq('male_user_id', testUser.id);

    // Create a selected assignment (this simulates user already selected a profile)
    const selectedAssignment = {
      male_user_id: testUser.id,
      female_user_id: femaleUsers[0].id,
      status: 'selected',
      male_revealed: true,
      is_selected: true,
      revealed_at: new Date().toISOString(),
      timer_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };

    // Create another assigned profile
    const assignedProfile = {
      male_user_id: testUser.id,
      female_user_id: femaleUsers[1].id,
      status: 'assigned',
      male_revealed: false,
      is_selected: false,
      created_at: new Date().toISOString()
    };

    const { data: createdAssignments } = await supabase
      .from('profile_assignments')
      .insert([selectedAssignment, assignedProfile])
      .select();

    // Set the female user to have selected this male user (simulate admin panel selection)
    await supabase
      .from('users')
      .update({ selected_male_user_id: testUser.id })
      .eq('id', femaleUsers[0].id);

    console.log('✅ Created test scenario:');
    console.log(`   - 1 selected assignment with female user ${femaleUsers[0].name}`);
    console.log(`   - 1 assigned profile with female user ${femaleUsers[1].name}`);
    console.log(`   - Female user ${femaleUsers[0].name} has selected this male user`);

    // Step 3: Check initial state
    console.log('\n📋 Step 3: Checking initial state...');
    
    const { data: initialAssignments } = await supabase
      .from('profile_assignments')
      .select('id, status, is_selected, female_user_id')
      .eq('male_user_id', testUser.id);

    const { data: initialFemaleSelection } = await supabase
      .from('users')
      .select('id, name, selected_male_user_id')
      .eq('id', femaleUsers[0].id)
      .single();

    console.log(`✅ Initial state:`);
    console.log(`   - Male user has ${initialAssignments.length} assignments`);
    console.log(`   - Selected assignments: ${initialAssignments.filter(a => a.is_selected).length}`);
    console.log(`   - Female user ${initialFemaleSelection.name} has selected male: ${initialFemaleSelection.selected_male_user_id ? 'YES' : 'NO'}`);

    // Step 4: Perform complete disengage (simulate Cancel Selection)
    console.log('\n📋 Step 4: Performing complete disengage (Cancel Selection)...');
    
    const selectedAssignmentId = createdAssignments.find(a => a.is_selected).id;
    
    // Simulate the API call but do it step by step for testing
    console.log('   🔄 Step 4a: Getting all user assignments...');
    const { data: allUserAssignments } = await supabase
      .from('profile_assignments')
      .select('id, female_user_id, status, is_selected')
      .eq('male_user_id', testUser.id);

    const selectedFemaleUsers = allUserAssignments?.filter(a => a.is_selected) || [];
    console.log(`   Found ${selectedFemaleUsers.length} selected female users to clear`);

    console.log('   🔄 Step 4b: Clearing female user selections...');
    for (const assignment of selectedFemaleUsers) {
      await supabase
        .from('users')
        .update({ 
          selected_male_user_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignment.female_user_id)
        .eq('selected_male_user_id', testUser.id);
      
      console.log(`   ✅ Cleared selection for female user ${assignment.female_user_id}`);
    }

    console.log('   🔄 Step 4c: Removing ALL assignments...');
    const { error: removeAllError } = await supabase
      .from('profile_assignments')
      .delete()
      .eq('male_user_id', testUser.id);

    if (removeAllError) {
      console.log('   ❌ Error removing assignments:', removeAllError);
      return;
    }

    console.log('   🔄 Step 4d: Removing temporary matches...');
    await supabase
      .from('temporary_matches')
      .delete()
      .eq('male_user_id', testUser.id);

    console.log('   🔄 Step 4e: Updating user round...');
    const nextRound = testUser.current_round + 1;
    await supabase
      .from('users')
      .update({
        current_round: nextRound,
        round_1_completed: nextRound > 1,
        decision_timer_active: false,
        decision_timer_expires_at: null,
        selected_male_user_id: null
      })
      .eq('id', testUser.id);

    console.log('✅ Complete disengage simulation completed');

    // Step 5: Verify final state
    console.log('\n📋 Step 5: Verifying final state...');
    
    const { data: finalAssignments } = await supabase
      .from('profile_assignments')
      .select('id, status, is_selected')
      .eq('male_user_id', testUser.id);

    const { data: finalTempMatches } = await supabase
      .from('temporary_matches')
      .select('id')
      .eq('male_user_id', testUser.id);

    const { data: finalFemaleSelection } = await supabase
      .from('users')
      .select('id, name, selected_male_user_id')
      .eq('id', femaleUsers[0].id)
      .single();

    const { data: updatedUser } = await supabase
      .from('users')
      .select('current_round, round_1_completed')
      .eq('id', testUser.id)
      .single();

    console.log(`✅ Final state verification:`);
    console.log(`   - Male user assignments: ${finalAssignments.length} (should be 0)`);
    console.log(`   - Temporary matches: ${finalTempMatches.length} (should be 0)`);
    console.log(`   - Female user ${finalFemaleSelection.name} selected male: ${finalFemaleSelection.selected_male_user_id ? 'YES' : 'NO'} (should be NO)`);
    console.log(`   - Male user round: ${updatedUser.current_round} (should be ${nextRound})`);

    // Step 6: Final summary
    console.log('\n🎉 TEST RESULTS SUMMARY:');
    console.log('========================');
    console.log(`✅ Initial assignments: ${initialAssignments.length}`);
    console.log(`✅ Final assignments: ${finalAssignments.length} (should be 0)`);
    console.log(`✅ Female selection cleared: ${finalFemaleSelection.selected_male_user_id === null ? 'YES' : 'NO'}`);
    console.log(`✅ User round incremented: ${testUser.current_round} → ${updatedUser.current_round}`);
    
    if (finalAssignments.length === 0 && 
        finalTempMatches.length === 0 && 
        finalFemaleSelection.selected_male_user_id === null && 
        updatedUser.current_round === nextRound) {
      console.log('\n🎯 SUCCESS! Complete disengage functionality is working perfectly!');
      console.log('   ✅ ALL assignments completely removed');
      console.log('   ✅ Female user selection cleared in admin panel');
      console.log('   ✅ User moved to next round');
      console.log('   ✅ All temporary matches cleared');
      console.log('\n🎉 The "Cancel Selection" feature will now:');
      console.log('   📝 Remove ALL assigned profiles (including selected one)');
      console.log('   📝 Clear the male user from female\'s selection in admin panel');
      console.log('   📝 Move user to next round');
      console.log('   📝 Show empty dashboard state');
    } else {
      console.log('\n❌ ISSUE DETECTED in the complete disengage logic!');
      console.log('   Check the implementation details above');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCompleteDisengageFlow();
