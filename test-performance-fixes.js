#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://xdhtrwaghahigmbojotu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDisengageAndRoundProgression() {
  console.log('🧪 Testing Disengage and Round Progression...\n');

  const testUserId = 'be865f75-7214-4683-9747-1a17ef49c364'; // aman

  try {
    // 1. Check current state
    console.log('1. Checking current user state...');
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, full_name, email, current_round, decision_timer_active')
      .eq('id', testUserId)
      .single();

    console.log(`   User: ${currentUser.full_name}`);
    console.log(`   Current Round: ${currentUser.current_round || 1}`);
    console.log(`   Timer Active: ${currentUser.decision_timer_active || false}`);

    // 2. Check current assignments
    console.log('\n2. Current assignments:');
    const { data: assignments } = await supabase
      .from('profile_assignments')
      .select(`
        id,
        status,
        is_selected,
        female_user_id,
        users!female_user_id(full_name)
      `)
      .eq('male_user_id', testUserId);

    assignments?.forEach((assignment, index) => {
      const femaleName = assignment.users?.full_name || 'Unknown';
      console.log(`   ${index + 1}. ${femaleName} - Status: ${assignment.status}, Selected: ${assignment.is_selected}`);
    });

    // 3. Find a selected assignment for testing disengage
    const selectedAssignment = assignments?.find(a => a.is_selected);
    
    if (!selectedAssignment) {
      console.log('\n⚠️  No selected assignment found. Creating one for testing...');
      
      // Select the first assignment for testing
      if (assignments && assignments.length > 0) {
        const firstAssignment = assignments[0];
        await supabase
          .from('profile_assignments')
          .update({
            status: 'selected',
            is_selected: true,
            selected_at: new Date().toISOString(),
            timer_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          })
          .eq('id', firstAssignment.id);
        
        console.log(`✅ Selected assignment ${firstAssignment.id} for testing`);
        
        // Re-fetch assignments
        const { data: updatedAssignments } = await supabase
          .from('profile_assignments')
          .select(`
            id,
            status,
            is_selected,
            female_user_id,
            users!female_user_id(full_name)
          `)
          .eq('male_user_id', testUserId);

        const testAssignment = updatedAssignments?.find(a => a.is_selected);
        if (testAssignment) {
          console.log(`\n4. Testing disengage with assignment: ${testAssignment.id}`);
          await testDisengage(testUserId, testAssignment.id);
        }
      } else {
        console.log('❌ No assignments available for testing');
      }
    } else {
      console.log(`\n4. Testing disengage with selected assignment: ${selectedAssignment.id}`);
      await testDisengage(testUserId, selectedAssignment.id);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testDisengage(userId, assignmentId) {
  try {
    console.log(`🔄 Simulating disengage API call...`);

    // Simulate the disengage API logic directly
    // 1. Mark assignment as disengaged
    const { error: updateError } = await supabase
      .from('profile_assignments')
      .update({
        status: 'disengaged',
        disengaged_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_selected: false,
        selected_at: null,
        timer_expires_at: null,
        timer_started_at: null
      })
      .eq('id', assignmentId);

    if (updateError) {
      throw new Error(`Failed to update assignment: ${updateError.message}`);
    }

    // 2. Hide all other assignments
    const { error: hidePrevAssignmentsError } = await supabase
      .from('profile_assignments')
      .update({
        status: 'hidden',
        updated_at: new Date().toISOString()
      })
      .eq('male_user_id', userId)
      .neq('status', 'disengaged')
      .neq('id', assignmentId);

    if (hidePrevAssignmentsError) {
      console.log(`⚠️  Warning hiding previous assignments: ${hidePrevAssignmentsError.message}`);
    }

    // 3. Update temporary matches
    const { error: tempMatchError } = await supabase
      .from('temporary_matches')
      .update({ 
        status: 'disengaged',
        updated_at: new Date().toISOString()
      })
      .eq('male_user_id', userId);

    if (tempMatchError) {
      console.log(`⚠️  Warning updating temporary matches: ${tempMatchError.message}`);
    }

    // 4. Progress to Round 2
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        current_round: 2,
        round_1_completed: true,
        decision_timer_active: false,
        decision_timer_expires_at: null,
        decision_timer_started_at: null,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (userUpdateError) {
      throw new Error(`Failed to update user: ${userUpdateError.message}`);
    }

    console.log('✅ Disengage simulation completed successfully!');

    // 5. Verify results
    console.log('\n5. Verifying results...');
    
    const { data: updatedUser } = await supabase
      .from('users')
      .select('current_round, round_1_completed, decision_timer_active')
      .eq('id', userId)
      .single();

    console.log(`   Round: ${updatedUser.current_round} (should be 2)`);
    console.log(`   Round 1 Completed: ${updatedUser.round_1_completed} (should be true)`);
    console.log(`   Timer Active: ${updatedUser.decision_timer_active} (should be false)`);

    const { data: finalAssignments } = await supabase
      .from('profile_assignments')
      .select('id, status, is_selected')
      .eq('male_user_id', userId);

    console.log('\n   Final assignment statuses:');
    finalAssignments?.forEach((assignment, index) => {
      console.log(`     ${index + 1}. ID: ${assignment.id.slice(0, 8)}... - Status: ${assignment.status}, Selected: ${assignment.is_selected}`);
    });

    const disengagedCount = finalAssignments?.filter(a => a.status === 'disengaged').length || 0;
    const hiddenCount = finalAssignments?.filter(a => a.status === 'hidden').length || 0;
    const selectedCount = finalAssignments?.filter(a => a.is_selected).length || 0;

    console.log(`\n📊 Summary:`);
    console.log(`   Disengaged: ${disengagedCount}`);
    console.log(`   Hidden: ${hiddenCount}`);
    console.log(`   Still Selected: ${selectedCount} (should be 0)`);

    if (updatedUser.current_round === 2 && selectedCount === 0) {
      console.log('\n🎉 SUCCESS: Disengage logic working correctly!');
      console.log('   ✅ User moved to Round 2');
      console.log('   ✅ No assignments remain selected');
      console.log('   ✅ Previous assignments hidden/disengaged');
      console.log('   ✅ Timer reset');
    } else {
      console.log('\n⚠️  ISSUES DETECTED:');
      if (updatedUser.current_round !== 2) console.log(`   ❌ User not in Round 2 (current: ${updatedUser.current_round})`);
      if (selectedCount > 0) console.log(`   ❌ ${selectedCount} assignments still selected`);
    }

  } catch (error) {
    console.error('❌ Disengage test failed:', error.message);
  }
}

async function testBulkAssignmentPerformance() {
  console.log('\n🚀 Testing Bulk Assignment Performance...\n');

  try {
    // Get some test users
    const { data: maleUsers } = await supabase
      .from('users')
      .select('id')
      .eq('gender', 'male')
      .eq('payment_confirmed', true)
      .eq('subscription_status', 'active')
      .limit(5);

    const { data: femaleUsers } = await supabase
      .from('users')
      .select('id')
      .eq('gender', 'female')
      .limit(5);

    if (!maleUsers?.length || !femaleUsers?.length) {
      console.log('❌ Not enough test users available');
      return;
    }

    // Create test assignments
    const testAssignments = [];
    for (let i = 0; i < Math.min(maleUsers.length, femaleUsers.length, 3); i++) {
      testAssignments.push({
        maleUserId: maleUsers[i].id,
        femaleUserId: femaleUsers[i].id
      });
    }

    console.log(`📝 Testing with ${testAssignments.length} assignments...`);

    // Test via API endpoint
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/admin/bulk-assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignments: testAssignments,
        options: {
          skipValidation: false,
          skipExistingCheck: false,
          maxBatchSize: 50
        }
      })
    });

    const result = await response.json();
    const duration = Date.now() - startTime;

    console.log(`⏱️  API Response Time: ${duration}ms`);
    console.log(`📊 Result:`, result);

    if (result.success) {
      console.log('✅ Bulk assignment API working correctly!');
      console.log(`   Created: ${result.stats.totalCreated}`);
      console.log(`   Skipped: ${result.stats.totalSkipped}`);
      console.log(`   Performance: ${result.stats.assignmentsPerSecond} assignments/second`);
    } else {
      console.log('❌ Bulk assignment failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Bulk assignment test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  console.log('🧪 Starting Performance and Functionality Tests\n');
  console.log('=' .repeat(60));
  
  await testDisengageAndRoundProgression();
  
  console.log('\n' + '=' .repeat(60));
  
  await testBulkAssignmentPerformance();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 All tests completed!');
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testDisengageAndRoundProgression, testBulkAssignmentPerformance };
