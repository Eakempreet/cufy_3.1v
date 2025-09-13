const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xdhtrwaghahigmbojotu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4'
);

async function checkMultipleAssignments() {
  try {
    console.log('🔍 Checking female assignment patterns...');
    
    const { data: assignments, error } = await supabase
      .from('profile_assignments')
      .select('male_user_id, female_user_id, status')
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
      femaleGroups[femaleId].push({
        maleId: assignment.male_user_id,
        status: assignment.status
      });
    });
    
    // Find females assigned to multiple males
    const multipleAssignments = Object.entries(femaleGroups).filter(([_, assignments]) => assignments.length > 1);
    
    console.log('📊 Results:');
    console.log('Total females in database:', Object.keys(femaleGroups).length);
    console.log('Females assigned to multiple males:', multipleAssignments.length);
    
    if (multipleAssignments.length > 0) {
      console.log('\n✅ GOOD: System allows females to be assigned to multiple males!');
      console.log('\n📋 Examples:');
      
      multipleAssignments.slice(0, 3).forEach(([femaleId, assignments]) => {
        console.log(`\nFemale ID: ${femaleId.substring(0, 8)}...`);
        console.log(`Assigned to ${assignments.length} males:`);
        assignments.forEach((assignment, i) => {
          console.log(`  ${i+1}. Male: ${assignment.maleId.substring(0, 8)}... Status: ${assignment.status}`);
        });
      });
    } else {
      console.log('\n❌ ISSUE: No female is assigned to multiple males - this might indicate a problem with the assignment logic');
    }
    
    // Also check the reverse - males assigned to multiple females
    console.log('\n🔄 Checking reverse: Males assigned to multiple females...');
    
    const maleGroups = {};
    assignments.forEach(assignment => {
      const maleId = assignment.male_user_id;
      if (!maleGroups[maleId]) {
        maleGroups[maleId] = [];
      }
      maleGroups[maleId].push({
        femaleId: assignment.female_user_id,
        status: assignment.status
      });
    });
    
    const multipleMaleAssignments = Object.entries(maleGroups).filter(([_, assignments]) => assignments.length > 1);
    console.log('Males assigned to multiple females:', multipleMaleAssignments.length);
    
    if (multipleMaleAssignments.length > 0) {
      console.log('✅ Males can have multiple female assignments');
      
      // Show example
      const [maleId, femaleAssignments] = multipleMaleAssignments[0];
      console.log(`\nExample: Male ${maleId.substring(0, 8)}... assigned to ${femaleAssignments.length} females:`);
      femaleAssignments.forEach((assignment, i) => {
        console.log(`  ${i+1}. Female: ${assignment.femaleId.substring(0, 8)}... Status: ${assignment.status}`);
      });
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkMultipleAssignments();
