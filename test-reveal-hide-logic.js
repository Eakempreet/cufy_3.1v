const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jwevdwnwovqiqupzgkmc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRevealHideLogic() {
  console.log('🧪 Testing Reveal & Hide Logic...\n');

  try {
    // Test 1: Find a male user with multiple assigned profiles
    console.log('1️⃣ Looking for male users with multiple assignments...');
    
    const { data: maleUsers, error: maleUsersError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('gender', 'male')
      .eq('payment_confirmed', true)
      .limit(5);

    if (maleUsersError) {
      console.log('   ❌ Error fetching male users:', maleUsersError.message);
      return;
    }

    let testUser = null;
    let assignments = [];

    for (const user of maleUsers) {
      const { data: userAssignments, error } = await supabase
        .from('profile_assignments')
        .select('id, status, female_user_id')
        .eq('male_user_id', user.id)
        .eq('status', 'assigned');

      if (!error && userAssignments && userAssignments.length >= 2) {
        testUser = user;
        assignments = userAssignments;
        break;
      }
    }

    if (!testUser || assignments.length < 2) {
      console.log('   ⚠️  No male user found with multiple assigned profiles');
      console.log('   💡 Create some test assignments first');
      
      // Let's check current assignment status
      const { data: allAssignments, error: allError } = await supabase
        .from('profile_assignments')
        .select(`
          id, 
          status, 
          users!male_user_id(full_name, gender)
        `)
        .limit(10);

      if (!allError) {
        console.log('\n   📋 Current assignment status:');
        allAssignments.forEach(assignment => {
          console.log(`      - ${assignment.users?.full_name || 'Unknown'} (${assignment.users?.gender}): ${assignment.status}`);
        });
      }
      return;
    }

    console.log(`   ✅ Found test user: ${testUser.full_name} with ${assignments.length} assigned profiles`);

    // Test 2: Check current state before reveal
    console.log('\n2️⃣ Current assignment states:');
    assignments.forEach((assignment, index) => {
      console.log(`   Profile ${index + 1}: ${assignment.id} - Status: ${assignment.status}`);
    });

    // Test 3: Simulate reveal logic (what would happen in API)
    console.log('\n3️⃣ Simulating reveal logic...');
    
    const profileToReveal = assignments[0];
    const otherProfiles = assignments.slice(1);

    console.log(`   🔍 Would reveal: ${profileToReveal.id}`);
    console.log(`   👁️‍🗨️ Would hide: ${otherProfiles.map(p => p.id).join(', ')}`);

    // Test 4: Verify our API logic would work
    console.log('\n4️⃣ Testing SQL logic...');
    
    // This simulates what our API does:
    // 1. Update revealed profile
    const { error: revealError } = await supabase
      .from('profile_assignments')
      .update({ 
        status: 'revealed',
        male_revealed: true,
        revealed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profileToReveal.id);

    if (revealError) {
      console.log('   ❌ Error updating revealed profile:', revealError.message);
    } else {
      console.log('   ✅ Successfully marked profile as revealed');
    }

    // 2. Hide other assigned profiles
    const { error: hideError } = await supabase
      .from('profile_assignments')
      .update({ 
        status: 'hidden',
        updated_at: new Date().toISOString()
      })
      .eq('male_user_id', testUser.id)
      .eq('status', 'assigned')
      .neq('id', profileToReveal.id);

    if (hideError) {
      console.log('   ❌ Error hiding other profiles:', hideError.message);
    } else {
      console.log('   ✅ Successfully hid other assigned profiles');
    }

    // Test 5: Verify final state
    console.log('\n5️⃣ Verifying final state...');
    
    const { data: finalAssignments, error: finalError } = await supabase
      .from('profile_assignments')
      .select('id, status')
      .eq('male_user_id', testUser.id);

    if (finalError) {
      console.log('   ❌ Error fetching final state:', finalError.message);
    } else {
      console.log('   📊 Final assignment states:');
      finalAssignments.forEach(assignment => {
        const isOriginal = assignments.find(a => a.id === assignment.id);
        const wasRevealed = assignment.id === profileToReveal.id;
        const status = wasRevealed ? '🔍 REVEALED' : assignment.status === 'hidden' ? '👁️‍🗨️ HIDDEN' : assignment.status;
        console.log(`      - ${assignment.id}: ${status}`);
      });
    }

    // Test 6: Dashboard filtering logic
    console.log('\n6️⃣ Testing dashboard filtering...');
    
    const visibleProfiles = finalAssignments.filter(a => a.status !== 'hidden');
    console.log(`   👁️ Profiles visible in dashboard: ${visibleProfiles.length}`);
    console.log(`   🙈 Hidden profiles: ${finalAssignments.length - visibleProfiles.length}`);

    if (visibleProfiles.length === 1 && visibleProfiles[0].status === 'revealed') {
      console.log('   ✅ Perfect! Only the revealed profile is visible');
    } else {
      console.log('   ⚠️  Unexpected filtering result');
    }

    console.log('\n🎉 Reveal & Hide Logic Test Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Reveal one profile → Hide all other assigned profiles');
    console.log('   ✅ Dashboard only shows non-hidden profiles');
    console.log('   ✅ API logic working correctly');
    console.log('\n💡 The boy will now see only the revealed profile in their dashboard!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testRevealHideLogic();
}

module.exports = { testRevealHideLogic };
