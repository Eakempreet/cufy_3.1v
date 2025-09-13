const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://xdhtrwaghahigmbojotu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProfileFix() {
  console.log('🔧 Testing Profile Selection Fix...\n');

  const testUserId = 'be865f75-7214-4683-9747-1a17ef49c364'; // aman

  try {
    // First, reset all assignments for this user to 'revealed' status
    console.log('1. Resetting all assignments to revealed status...');
    const { error: resetError } = await supabase
      .from('profile_assignments')
      .update({ 
        status: 'revealed',
        is_selected: false,
        selected_at: null,
        timer_expires_at: null
      })
      .eq('male_user_id', testUserId);

    if (resetError) {
      console.error('Reset error:', resetError.message);
      return;
    }
    console.log('✅ Reset successful');

    // Check current state
    console.log('\n2. Current assignments after reset:');
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

    beforeAssignments?.forEach((assignment, index) => {
      const femaleName = assignment.users?.full_name || 'Unknown';
      console.log(`   ${index + 1}. ${femaleName} - Status: ${assignment.status}, Selected: ${assignment.is_selected}`);
    });

    // Now simulate selecting the first profile (this should trigger the new API logic)
    if (beforeAssignments && beforeAssignments.length > 0) {
      const selectedAssignmentId = beforeAssignments[0].id;
      const selectedFemaleName = beforeAssignments[0].users?.full_name || 'Unknown';
      
      console.log(`\n3. Simulating selection of ${selectedFemaleName} (ID: ${selectedAssignmentId})...\n`);

      // Simulate the API logic directly
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

      // Update selected assignment
      const { data: updateData, error: updateError } = await supabase
        .from('profile_assignments')
        .update({
          status: 'selected',
          is_selected: true,
          selected_at: new Date().toISOString(),
          timer_expires_at: expiresAt.toISOString()
        })
        .eq('id', selectedAssignmentId)
        .select('id, status, is_selected');

      if (updateError) {
        console.error('Update error:', updateError.message);
        return;
      }
      console.log('✅ Selected profile updated:', updateData);

      // Hide other profiles
      const { data: hiddenProfiles, error: hideError } = await supabase
        .from('profile_assignments')
        .update({ status: 'hidden' })
        .eq('male_user_id', testUserId)
        .neq('id', selectedAssignmentId)
        .in('status', ['assigned', 'revealed'])
        .select('id, status');

      if (hideError) {
        console.error('Hide error:', hideError.message);
        return;
      }
      console.log(`✅ Hidden ${hiddenProfiles?.length || 0} other profiles`);

      // Check final state
      console.log('\n4. Final assignments after selection:');
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
        else visibleCount++;
      });

      console.log(`\n📊 Final Summary:`);
      console.log(`   Selected: ${selectedCount}`);
      console.log(`   Hidden: ${hiddenCount}`);
      console.log(`   Still Visible: ${visibleCount}`);

      if (selectedCount === 1 && hiddenCount > 0 && visibleCount === 0) {
        console.log(`\n🎉 SUCCESS: Profile selection logic working correctly!`);
        console.log(`   ✅ One profile selected`);
        console.log(`   ✅ Other profiles hidden`);
        console.log(`   ✅ Dashboard should now show only the selected profile`);
      } else {
        console.log(`\n⚠️  ISSUE: Profile selection logic needs adjustment`);
        if (selectedCount !== 1) console.log(`   ❌ Expected 1 selected, got ${selectedCount}`);
        if (hiddenCount === 0) console.log(`   ❌ No profiles were hidden`);
        if (visibleCount > 0) console.log(`   ❌ ${visibleCount} profiles still visible (should be 0)`);
      }
    } else {
      console.log('❌ No assignments found for user');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testProfileFix();
}

module.exports = { testProfileFix };
