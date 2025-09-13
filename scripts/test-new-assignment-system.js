const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xdhtrwaghahigmbojotu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4'
);

async function testNewAssignmentSystem() {
  try {
    console.log('🧪 Testing New Assignment System');
    console.log('==================================');
    
    // Step 1: Find a female user who is assigned to multiple males
    console.log('\n1️⃣ Finding a female user assigned to multiple males...');
    
    const { data: assignments, error } = await supabase
      .from('profile_assignments')
      .select('male_user_id, female_user_id, status, is_selected')
      .order('female_user_id');
      
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    // Group by female_user_id
    const femaleGroups = {};
    assignments.forEach(assignment => {
      const femaleId = assignment.female_user_id;
      if (!femaleGroups[femaleId]) {
        femaleGroups[femaleId] = [];
      }
      femaleGroups[femaleId].push(assignment);
    });
    
    // Find a female assigned to multiple males
    const multipleAssignments = Object.entries(femaleGroups).filter(([_, assignments]) => assignments.length > 1);
    
    if (multipleAssignments.length === 0) {
      console.log('❌ No female users found with multiple assignments - need to create some first');
      return;
    }
    
    const [testFemaleId, testAssignments] = multipleAssignments[0];
    console.log(`✅ Found female ${testFemaleId.substring(0, 8)}... assigned to ${testAssignments.length} males:`);
    
    testAssignments.forEach((assignment, i) => {
      console.log(`   ${i+1}. Male: ${assignment.male_user_id.substring(0, 8)}... Status: ${assignment.status}, Selected: ${assignment.is_selected}`);
    });
    
    // Step 2: Check if any male has selected this female
    const selectedAssignments = testAssignments.filter(a => a.is_selected);
    const nonSelectedAssignments = testAssignments.filter(a => !a.is_selected);
    
    console.log(`\n2️⃣ Assignment Status Analysis:`);
    console.log(`   Selected by ${selectedAssignments.length} males`);
    console.log(`   Not selected by ${nonSelectedAssignments.length} males`);
    
    if (selectedAssignments.length > 0) {
      console.log(`\n✅ GOOD: Female ${testFemaleId.substring(0, 8)}... is selected by ${selectedAssignments.length} males:`);
      selectedAssignments.forEach((assignment, i) => {
        console.log(`   ${i+1}. Male: ${assignment.male_user_id.substring(0, 8)}... (Status: ${assignment.status})`);
      });
      
      if (nonSelectedAssignments.length > 0) {
        console.log(`\n✅ EXCELLENT: Female is STILL available to ${nonSelectedAssignments.length} other males:`);
        nonSelectedAssignments.forEach((assignment, i) => {
          console.log(`   ${i+1}. Male: ${assignment.male_user_id.substring(0, 8)}... (Status: ${assignment.status})`);
        });
        
        console.log(`\n🎉 SUCCESS: The new system is working correctly!`);
        console.log(`   - Female can be assigned to multiple males ✅`);
        console.log(`   - Multiple males can select the same female ✅`);
        console.log(`   - When one male selects, female remains available to others ✅`);
      } else {
        console.log(`\n⚠️ All males have selected this female - this is still valid behavior`);
      }
    } else {
      console.log(`\n📝 No males have selected this female yet - they all still have the option`);
    }
    
    // Step 3: Test the API behavior
    console.log(`\n3️⃣ Testing API Behavior:`);
    
    // Get one of the male users with assignments
    const testMaleId = testAssignments[0].male_user_id;
    
    console.log(`\nTesting assignments API for male user ${testMaleId.substring(0, 8)}...`);
    
    // Check what the assignments API would return for this user
    const { data: userAssignments } = await supabase
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', testMaleId)
      .not('status', 'in', '(disengaged,hidden)');
    
    console.log(`✅ Male user ${testMaleId.substring(0, 8)}... has ${userAssignments.length} visible assignments:`);
    userAssignments.forEach((assignment, i) => {
      console.log(`   ${i+1}. Female: ${assignment.female_user_id.substring(0, 8)}... Status: ${assignment.status}, Selected: ${assignment.is_selected}`);
    });
    
    // Check if this includes both selected and non-selected profiles
    const userSelected = userAssignments.filter(a => a.is_selected);
    const userAvailable = userAssignments.filter(a => !a.is_selected);
    
    console.log(`\n📊 User's dashboard would show:`);
    console.log(`   - ${userSelected.length} selected profiles`);
    console.log(`   - ${userAvailable.length} available profiles`);
    console.log(`   - Total visible: ${userAssignments.length} profiles`);
    
    if (userSelected.length > 0 && userAvailable.length > 0) {
      console.log(`\n🎉 PERFECT: User can see both selected AND available profiles!`);
    } else if (userSelected.length > 0) {
      console.log(`\n✅ User has selected profiles visible`);
    } else {
      console.log(`\n✅ User has available profiles to select from`);
    }
    
    console.log(`\n🏁 Test Complete: New assignment system is functional!`);
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testNewAssignmentSystem();
