const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xdhtrwaghahigmbojotu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function exploreAssignmentSystem() {
  try {
    console.log('🔍 Exploring Assignment System...\n');
    
    // Check profile_assignments table
    console.log('📋 PROFILE ASSIGNMENTS:');
    const { data: assignments, error: assignError } = await supabase
      .from('profile_assignments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (assignError) {
      console.error('❌ Error fetching assignments:', assignError);
    } else {
      console.log(`Total assignments: ${assignments.length}`);
      if (assignments.length > 0) {
        console.log('Recent assignments:');
        assignments.slice(0, 5).forEach((assignment, i) => {
          console.log(`${i+1}. User ${assignment.user_id} → Assigned ${assignment.assigned_user_id} (Status: ${assignment.status})`);
        });
      }
    }
    
    console.log('\n🕐 TEMPORARY MATCHES:');
    const { data: tempMatches, error: tempError } = await supabase
      .from('temporary_matches')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (tempError) {
      console.error('❌ Error fetching temp matches:', tempError);
    } else {
      console.log(`Total temporary matches: ${tempMatches.length}`);
      if (tempMatches.length > 0) {
        console.log('Recent temp matches:');
        tempMatches.slice(0, 5).forEach((match, i) => {
          const timeLeft = match.expires_at ? new Date(match.expires_at).getTime() - Date.now() : 0;
          const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
          console.log(`${i+1}. ${match.user1_id} ↔ ${match.user2_id} (${hoursLeft}h left, Status: ${match.status})`);
          if (match.user1_disengaged) console.log(`   └─ User1 disengaged at: ${match.user1_disengaged}`);
          if (match.user2_disengaged) console.log(`   └─ User2 disengaged at: ${match.user2_disengaged}`);
        });
      }
    }
    
    console.log('\n💝 PERMANENT MATCHES:');
    const { data: permMatches, error: permError } = await supabase
      .from('permanent_matches')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (permError) {
      console.error('❌ Error fetching permanent matches:', permError);
    } else {
      console.log(`Total permanent matches: ${permMatches.length}`);
      if (permMatches.length > 0) {
        console.log('Recent permanent matches:');
        permMatches.slice(0, 5).forEach((match, i) => {
          console.log(`${i+1}. ${match.user1_id} ↔ ${match.user2_id} (Created: ${new Date(match.created_at).toLocaleDateString()})`);
        });
      }
    }
    
    // Check boys entry control
    console.log('\n👨 BOYS ENTRY CONTROL:');
    const { data: boysControl, error: boysError } = await supabase
      .from('boys_entry_control')
      .select('*');
    
    if (boysError) {
      console.log('❌ Boys entry control table not found, needs to be created');
    } else {
      console.log(`Boys registration enabled: ${boysControl[0]?.enabled || false}`);
    }
    
    // Get subscription breakdown for assignment logic
    console.log('\n💳 SUBSCRIPTION BREAKDOWN:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('subscription_type, payment_confirmed, gender')
      .eq('payment_confirmed', true);
    
    if (!usersError && users) {
      const paidUsers = users.filter(u => u.payment_confirmed);
      const premiumUsers = users.filter(u => u.subscription_type === 'premium');
      const basicUsers = users.filter(u => u.subscription_type === 'basic');
      
      console.log(`Paid users: ${paidUsers.length}`);
      console.log(`Premium users: ${premiumUsers.length}`);
      console.log(`Basic users: ${basicUsers.length}`);
      
      const paidMales = paidUsers.filter(u => u.gender === 'male').length;
      const paidFemales = paidUsers.filter(u => u.gender === 'female').length;
      console.log(`Paid males: ${paidMales}, Paid females: ${paidFemales}`);
    }
    
  } catch (error) {
    console.error('💥 Exploration failed:', error);
  }
}

exploreAssignmentSystem();
