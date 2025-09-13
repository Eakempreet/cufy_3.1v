const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jwevdwnwovqiqupzgkmc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testEnhancedMatchingSystem() {
  console.log('🧪 Testing Enhanced Matching System...\n');

  try {
    // Test 1: Check schema updates
    console.log('1️⃣ Testing schema updates...');
    
    // Check users table columns
    const { data: usersColumns, error: usersError } = await supabase
      .from('users')
      .select('current_round, round_1_completed, decision_timer_active')
      .limit(1);
    
    if (usersError) {
      console.log('   ⚠️  Users table: Some columns may be missing');
      console.log('   💡 Run the safe-enhanced-matching-system.sql file in Supabase SQL Editor');
    } else {
      console.log('   ✅ Users table: Enhanced columns available');
    }

    // Check profile_assignments table columns  
    const { data: assignmentsColumns, error: assignmentsError } = await supabase
      .from('profile_assignments')
      .select('round_number, is_selected, timer_ends_at')
      .limit(1);
    
    if (assignmentsError) {
      console.log('   ⚠️  Profile assignments table: Some columns may be missing');
      console.log('   💡 Run the safe-enhanced-matching-system.sql file in Supabase SQL Editor');
    } else {
      console.log('   ✅ Profile assignments table: Enhanced columns available');
    }

    // Test 2: Check API endpoints
    console.log('\n2️⃣ Testing API endpoints...');
    
    console.log('   📡 Select profile API: /api/user/select-profile');
    console.log('   📡 Disengage API: /api/user/disengage');
    console.log('   📡 Dashboard API: /api/user/dashboard (for fetching data)');
    
    // Test 3: Check for active users with assignments
    console.log('\n3️⃣ Checking current system state...');
    
    const { data: activeUsers, error: activeUsersError } = await supabase
      .from('users')
      .select('id, full_name, gender, current_round, subscription_plan')
      .eq('payment_confirmed', true)
      .not('gender', 'is', null)
      .limit(10);
    
    if (activeUsersError) {
      console.log('   ❌ Error fetching active users:', activeUsersError.message);
    } else {
      console.log(`   👥 Found ${activeUsers.length} active users:`);
      activeUsers.forEach(user => {
        console.log(`      - ${user.full_name} (${user.gender}) - Round ${user.current_round || 1} - ${user.subscription_plan || 'Basic'}`);
      });
    }

    // Check active assignments
    const { data: activeAssignments, error: assignmentsActiveError } = await supabase
      .from('profile_assignments')
      .select(`
        id,
        status,
        round_number,
        is_selected,
        timer_ends_at,
        users!male_user_id(full_name, current_round)
      `)
      .in('status', ['assigned', 'selected', 'revealed'])
      .limit(10);
    
    if (assignmentsActiveError) {
      console.log('   ❌ Error fetching assignments:', assignmentsActiveError.message);
    } else {
      console.log(`\n   📋 Found ${activeAssignments.length} active assignments:`);
      activeAssignments.forEach(assignment => {
        const timerInfo = assignment.timer_ends_at ? 
          `Timer: ${new Date(assignment.timer_ends_at).toLocaleString()}` : 'No timer';
        console.log(`      - ${assignment.users?.full_name || 'Unknown'} - ${assignment.status} - Round ${assignment.round_number || 1} - ${timerInfo}`);
      });
    }

    // Test 4: Business logic validation
    console.log('\n4️⃣ Testing business logic...');
    
    // Find premium and basic users
    const { data: premiumUsers, error: premiumError } = await supabase
      .from('users')
      .select('id, full_name, subscription_amount')
      .eq('payment_confirmed', true)
      .eq('subscription_amount', 249)
      .limit(3);
      
    const { data: basicUsers, error: basicError } = await supabase
      .from('users')
      .select('id, full_name, subscription_amount')
      .eq('payment_confirmed', true)
      .eq('subscription_amount', 99)
      .limit(3);
    
    if (!premiumError && premiumUsers) {
      console.log(`   💎 Premium users (₹249): ${premiumUsers.length}`);
      console.log('   💡 Should get: Round 1 (2 options) → Round 2 (3 options)');
    }
    
    if (!basicError && basicUsers) {
      console.log(`   🔷 Basic users (₹99): ${basicUsers.length}`);
      console.log('   💡 Should get: Round 1 (1 option) → Round 2 (1 option)');
    }

    // Test 5: Timer functionality
    console.log('\n5️⃣ Testing timer functionality...');
    
    const { data: timedAssignments, error: timedError } = await supabase
      .from('profile_assignments')
      .select('id, timer_ends_at, status')
      .eq('is_selected', true)
      .not('timer_ends_at', 'is', null);
    
    if (!timedError && timedAssignments) {
      console.log(`   ⏰ Found ${timedAssignments.length} assignments with active timers`);
      timedAssignments.forEach(assignment => {
        const timeLeft = new Date(assignment.timer_ends_at) - new Date();
        const status = timeLeft > 0 ? 'Active' : 'Expired';
        console.log(`      - Assignment ${assignment.id}: ${status} (${Math.round(timeLeft / (1000 * 60 * 60))}h remaining)`);
      });
    }

    console.log('\n🎉 Enhanced Matching System Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Run sql-files/safe-enhanced-matching-system.sql in Supabase SQL Editor if any schema issues');
    console.log('   2. Test the Dashboard component at /dashboard');
    console.log('   3. Verify select profile and disengage functionality');
    console.log('   4. Check timer display and auto-confirm logic');
    console.log('   5. Test round progression (Round 1 → Round 2)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testEnhancedMatchingSystem();
}

module.exports = { testEnhancedMatchingSystem };
