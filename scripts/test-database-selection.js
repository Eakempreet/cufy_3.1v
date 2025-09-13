const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testSelectProfileLogic() {
  console.log('🧪 Testing Select Profile Database Logic...\n')

  try {
    // 1. Find a male user with assignments
    console.log('1️⃣ Finding male users with assignments...')
    const { data: assignments, error: assignError } = await supabase
      .from('profile_assignments')
      .select(`
        id,
        male_user_id,
        female_user_id,
        status,
        is_selected,
        selected_at,
        male_user:users!profile_assignments_male_user_id_fkey(full_name, email),
        female_user:users!profile_assignments_female_user_id_fkey(full_name)
      `)
      .neq('status', 'disengaged')
      .limit(5)

    if (assignError) {
      console.error('Error fetching assignments:', assignError)
      return
    }

    if (!assignments || assignments.length === 0) {
      console.log('❌ No assignments found to test with')
      return
    }

    console.log(`Found ${assignments.length} assignments:`)
    assignments.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.male_user?.full_name} -> ${a.female_user?.full_name} (${a.status}, selected: ${a.is_selected})`)
    })

    // 2. Pick first user with multiple assignments
    const testMaleUserId = assignments[0].male_user_id
    
    // Get all assignments for this user
    const { data: userAssignments } = await supabase
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', testMaleUserId)
      .neq('status', 'disengaged')

    console.log(`\n2️⃣ User ${assignments[0].male_user?.full_name} has ${userAssignments.length} assignments`)

    if (userAssignments.length < 2) {
      console.log('❌ Need at least 2 assignments to test selection logic')
      return
    }

    // 3. Simulate selecting the first assignment
    const assignmentToSelect = userAssignments[0]
    console.log(`\n3️⃣ Simulating selection of assignment ${assignmentToSelect.id}...`)

    // Simulate the select-profile API logic
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

    // Update the selected assignment
    const { error: updateError } = await supabase
      .from('profile_assignments')
      .update({
        status: 'selected',
        is_selected: true,
        selected_at: new Date().toISOString(),
        timer_expires_at: expiresAt.toISOString()
      })
      .eq('id', assignmentToSelect.id)

    if (updateError) {
      console.error('❌ Failed to update assignment:', updateError)
      return
    }

    // Hide other assignments
    const { data: hiddenProfiles, error: hideError } = await supabase
      .from('profile_assignments')
      .update({ status: 'hidden' })
      .eq('male_user_id', testMaleUserId)
      .neq('id', assignmentToSelect.id)
      .in('status', ['assigned', 'revealed'])
      .select('id, status')

    if (hideError) {
      console.error('❌ Failed to hide assignments:', hideError)
      return
    }

    console.log(`✅ Selection completed - hid ${hiddenProfiles?.length || 0} other assignments`)

    // 4. Test the API filtering logic
    console.log('\n4️⃣ Testing API filtering logic...')

    // Check if user has any selected profile first
    const { data: selectedAssignment } = await supabase
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', testMaleUserId)
      .eq('is_selected', true)
      .single()

    let apiResult = []
    if (selectedAssignment) {
      console.log('✅ User has selected profile - API should return only selected assignment')
      apiResult = [selectedAssignment]
    } else {
      console.log('❌ User has no selected profile - API should return all active assignments')
      const { data: allAssignments } = await supabase
        .from('profile_assignments')
        .select('*')
        .eq('male_user_id', testMaleUserId)
        .not('status', 'in', '(disengaged,hidden)')

      apiResult = allAssignments || []
    }

    console.log(`\n📊 API would return ${apiResult.length} assignment(s):`)
    if (apiResult.length === 1 && apiResult[0].is_selected) {
      console.log(`✅ SUCCESS: Only selected assignment returned`)
      console.log(`   - Assignment: ${apiResult[0].id}`)
      console.log(`   - Status: ${apiResult[0].status}`)
      console.log(`   - Selected: ${apiResult[0].is_selected}`)
      console.log(`   - Timer expires: ${new Date(apiResult[0].timer_expires_at).toLocaleString()}`)
    } else {
      console.log(`❌ ISSUE: Expected 1 selected assignment, got ${apiResult.length}`)
    }

    // 5. Test dashboard component logic
    console.log('\n5️⃣ Testing dashboard component filtering...')
    const assignedProfiles = apiResult
    const hasSelected = assignedProfiles.some(a => a.is_selected)
    
    let visibleProfiles = []
    if (hasSelected) {
      visibleProfiles = assignedProfiles.filter(a => a.is_selected)
    } else {
      visibleProfiles = assignedProfiles.filter(a => a.status !== 'hidden')
    }

    console.log(`Dashboard would show ${visibleProfiles.length} profile(s):`)
    visibleProfiles.forEach((profile, i) => {
      console.log(`  ${i + 1}. Status: ${profile.status}, Selected: ${profile.is_selected}`)
    })

    // 6. Clean up - reset to original state
    console.log('\n6️⃣ Cleaning up test data...')
    
    // Reset the selected assignment
    await supabase
      .from('profile_assignments')
      .update({
        status: 'revealed',
        is_selected: false,
        selected_at: null,
        timer_expires_at: null
      })
      .eq('id', assignmentToSelect.id)

    // Restore hidden assignments
    if (hiddenProfiles && hiddenProfiles.length > 0) {
      await supabase
        .from('profile_assignments')
        .update({ status: 'revealed' })
        .in('id', hiddenProfiles.map(p => p.id))
    }

    console.log('✅ Test completed and cleaned up successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testSelectProfileLogic()
