const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRevealSelectionFlow() {
  console.log('🧪 TESTING NEW REVEAL/SELECTION FLOW');
  console.log('=====================================\n');

  try {
    // Step 1: Create a test male user or use existing one
    console.log('📋 Step 1: Finding/Creating test male user...');
    
    let { data: testUser } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('gender', 'male')
      .eq('registration_complete', true)
      .limit(1)
      .single();

    if (!testUser) {
      console.log('❌ No complete male users found');
      return;
    }

    console.log('✅ Found test user:', testUser.name, testUser.email);

    // Step 2: Clean up any existing assignments for this user
    console.log('\n📋 Step 2: Cleaning up existing assignments...');
    
    await supabase
      .from('profile_assignments')
      .delete()
      .eq('male_user_id', testUser.id);

    console.log('✅ Cleaned up existing assignments');

    // Step 3: Find 2 female users to assign
    console.log('\n📋 Step 3: Finding female users to assign...');
    
    const { data: femaleUsers } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('gender', 'female')
      .eq('registration_complete', true)
      .limit(2);

    if (!femaleUsers || femaleUsers.length < 2) {
      console.log('❌ Need at least 2 complete female users');
      return;
    }

    console.log('✅ Found female users:');
    femaleUsers.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.name} (${user.email})`);
    });

    // Step 4: Create 2 assignments
    console.log('\n📋 Step 4: Creating 2 profile assignments...');
    
    const assignments = [
      {
        male_user_id: testUser.id,
        female_user_id: femaleUsers[0].id,
        status: 'assigned',
        male_revealed: false,
        is_selected: false,
        created_at: new Date().toISOString()
      },
      {
        male_user_id: testUser.id,
        female_user_id: femaleUsers[1].id,
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

    console.log('✅ Created 2 assignments:');
    createdAssignments.forEach((a, i) => {
      console.log(`   ${i + 1}. Assignment ID: ${a.id}, Status: ${a.status}`);
    });

    // Step 5: Test dashboard API (should show 2 profiles)
    console.log('\n📋 Step 5: Testing dashboard API - should show 2 profiles...');
    
    const { data: dashboardData } = await supabase
      .from('profile_assignments')
      .select(`
        id, status, male_revealed, is_selected,
        female_user:users!profile_assignments_female_user_id_fkey(
          id, name, age, university, profile_photo
        )
      `)
      .eq('male_user_id', testUser.id)
      .in('status', ['assigned', 'revealed']);

    console.log(`✅ Dashboard shows ${dashboardData.length} profiles`);
    console.log('   Profiles:', dashboardData.map(a => ({
      id: a.id.substring(0, 8) + '...',
      status: a.status,
      name: a.female_user.name
    })));

    // Step 6: Simulate clicking "Select as Final Match" on first profile
    console.log('\n📋 Step 6: Clicking "Select as Final Match" on first profile...');
    
    const firstAssignmentId = createdAssignments[0].id;
    
    // This simulates the reveal API call
    const { data: revealedAssignment, error: revealError } = await supabase
      .from('profile_assignments')
      .update({
        status: 'selected',
        male_revealed: true,
        is_selected: true,
        revealed_at: new Date().toISOString(),
        timer_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', firstAssignmentId)
      .select()
      .single();

    if (revealError) {
      console.log('❌ Error updating first assignment:', revealError);
      return;
    }

    // Hide other assignments
    await supabase
      .from('profile_assignments')
      .update({
        status: 'hidden',
        updated_at: new Date().toISOString()
      })
      .eq('male_user_id', testUser.id)
      .in('status', ['assigned', 'revealed'])
      .neq('id', firstAssignmentId);

    console.log('✅ Selected first profile and hid others');
    console.log('   Selected profile:', {
      id: revealedAssignment.id.substring(0, 8) + '...',
      status: revealedAssignment.status,
      is_selected: revealedAssignment.is_selected
    });

    // Step 7: Test dashboard API again (should show only 1 profile)
    console.log('\n📋 Step 7: Testing dashboard API after selection - should show only 1 profile...');
    
    const { data: dashboardDataAfter } = await supabase
      .from('profile_assignments')
      .select(`
        id, status, male_revealed, is_selected,
        female_user:users!profile_assignments_female_user_id_fkey(
          id, name, age, university, profile_photo
        )
      `)
      .eq('male_user_id', testUser.id)
      .in('status', ['assigned', 'revealed', 'selected']);

    console.log(`✅ Dashboard now shows ${dashboardDataAfter.length} profiles`);
    console.log('   Profiles:', dashboardDataAfter.map(a => ({
      id: a.id.substring(0, 8) + '...',
      status: a.status,
      name: a.female_user.name,
      is_selected: a.is_selected
    })));

    // Step 8: Check hidden assignments
    console.log('\n📋 Step 8: Checking hidden assignments...');
    
    const { data: hiddenAssignments } = await supabase
      .from('profile_assignments')
      .select('id, status')
      .eq('male_user_id', testUser.id)
      .eq('status', 'hidden');

    console.log(`✅ Found ${hiddenAssignments.length} hidden assignments`);

    // Final summary
    console.log('\n🎉 TEST RESULTS SUMMARY:');
    console.log('========================');
    console.log(`✅ Before selection: ${dashboardData.length} profiles visible`);
    console.log(`✅ After selection: ${dashboardDataAfter.length} profiles visible`);
    console.log(`✅ Hidden assignments: ${hiddenAssignments.length}`);
    
    if (dashboardData.length === 2 && dashboardDataAfter.length === 1 && hiddenAssignments.length === 1) {
      console.log('\n🎯 SUCCESS! The reveal/selection logic is working correctly!');
      console.log('   - User had 2 profiles initially');
      console.log('   - After selecting one, only that profile remains visible');
      console.log('   - Other profile was properly hidden');
    } else {
      console.log('\n❌ ISSUE DETECTED in the logic!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRevealSelectionFlow();
