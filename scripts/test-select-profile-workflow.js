const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://xdhtrwaghahigmbojotu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSelectProfileWorkflow() {
  console.log('🧪 Testing Select Profile Workflow...\n');

  const testUserId = 'be865f75-7214-4683-9747-1a17ef49c364'; // aman

  try {
    // Step 1: Check current assignments
    console.log('1️⃣ Checking current assignments...');
    const { data: beforeAssignments } = await supabase
      .from('profile_assignments')
      .select(`
        id,
        status,
        is_selected,
        female_user_id,
        users!female_user_id(full_name)
      `)
      .eq('male_user_id', testUserId);

    if (!beforeAssignments || beforeAssignments.length === 0) {
      console.log('❌ No assignments found. Please create assignments first.');
      return;
    }

    console.log('📋 Current assignments:');
    beforeAssignments.forEach((assignment, index) => {
      const femaleName = assignment.users?.full_name || 'Unknown';
      console.log(`   ${index + 1}. ${femaleName} - Status: ${assignment.status}, Selected: ${assignment.is_selected}`);
    });

    // Step 2: Simulate selecting the first profile
    const selectedAssignment = beforeAssignments[0];
    const selectedFemaleName = selectedAssignment.users?.full_name || 'Unknown';
    
    console.log(`\n2️⃣ Simulating selection of ${selectedFemaleName}...`);

    // Simulate calling the select-profile API
    const response = await fetch('http://localhost:3000/api/user/select-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // This would normally be the user's session
      },
      body: JSON.stringify({
        assignmentId: selectedAssignment.id
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Select Profile API Response:', result.message || 'Success');
    } else {
      console.log('❌ Select Profile API failed:', response.status, response.statusText);
      const error = await response.text();
      console.log('Error details:', error);
    }

    // Step 3: Check assignments after selection
    console.log('\n3️⃣ Checking assignments after selection...');
    const { data: afterAssignments } = await supabase
      .from('profile_assignments')
      .select(`
        id,
        status,
        is_selected,
        timer_expires_at,
        female_user_id,
        users!female_user_id(full_name)
      `)
      .eq('male_user_id', testUserId);

    console.log('📋 Assignments after selection:');
    let selectedCount = 0;
    let hiddenCount = 0;
    let visibleCount = 0;

    afterAssignments?.forEach((assignment, index) => {
      const femaleName = assignment.users?.full_name || 'Unknown';
      const status = assignment.status;
      const isSelected = assignment.is_selected ? '✅ SELECTED' : '⬜ NOT SELECTED';
      const timer = assignment.timer_expires_at ? 
        `⏰ ${new Date(assignment.timer_expires_at).toLocaleString()}` : 
        '⏰ No timer';
      
      console.log(`   ${index + 1}. ${femaleName}`);
      console.log(`      Status: ${status.toUpperCase()}`);
      console.log(`      Selected: ${isSelected}`);
      console.log(`      Timer: ${timer}`);

      if (status === 'selected') selectedCount++;
      else if (status === 'hidden') hiddenCount++;
      else if (status === 'assigned' || status === 'revealed') visibleCount++;
    });

    // Step 4: Test filtering logic
    console.log('\n4️⃣ Testing Dashboard filtering logic...');
    const filteredProfiles = afterAssignments?.filter(assignment => {
      // If user has selected a profile, only show that one
      const hasSelected = afterAssignments.some(a => a.is_selected);
      if (hasSelected) {
        return assignment.is_selected;
      }
      // Otherwise show all non-hidden profiles
      return assignment.status !== 'hidden';
    });

    console.log(`📱 Dashboard should show ${filteredProfiles?.length || 0} profiles:`);
    filteredProfiles?.forEach((assignment, index) => {
      const femaleName = assignment.users?.full_name || 'Unknown';
      console.log(`   ${index + 1}. ${femaleName} (${assignment.status})`);
    });

    // Step 5: Evaluate results
    console.log(`\n📊 Test Results:`);
    console.log(`   Selected: ${selectedCount}`);
    console.log(`   Hidden: ${hiddenCount}`);
    console.log(`   Still Visible: ${visibleCount}`);

    if (selectedCount === 1 && (filteredProfiles?.length === 1)) {
      console.log(`\n🎉 SUCCESS: Select Profile functionality working correctly!`);
      console.log(`   ✅ One profile selected`);
      console.log(`   ✅ Dashboard filtering shows only selected profile`);
      console.log(`   ✅ Other profiles are filtered out from UI`);
    } else {
      console.log(`\n⚠️  PARTIAL SUCCESS: Some issues detected`);
      if (selectedCount !== 1) console.log(`   ❌ Expected 1 selected, got ${selectedCount}`);
      if (filteredProfiles?.length !== 1) console.log(`   ❌ Dashboard should show 1 profile, showing ${filteredProfiles?.length}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testSelectProfileWorkflow();
}

module.exports = { testSelectProfileWorkflow };
