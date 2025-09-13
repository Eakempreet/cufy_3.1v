const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testCompleteSelectionFlow() {
  console.log('🧪 Testing Complete Dashboard Selection Flow...\n')

  try {
    // 1. Find a male user with assignments for testing
    const { data: maleUsers, error: maleError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('gender', 'male')
      .limit(5)

    if (maleError || !maleUsers.length) {
      console.log('❌ No male users found for testing')
      return
    }

    console.log(`📋 Found ${maleUsers.length} male users to test with`)

    for (const maleUser of maleUsers) {
      console.log(`\n👤 Testing with user: ${maleUser.full_name} (${maleUser.email})`)

      // 2. Check current assignments
      const { data: assignments, error: assignError } = await supabase
        .from('profile_assignments')
        .select(`
          id,
          status,
          is_selected,
          timer_expires_at,
          female_user_id,
          male_revealed,
          female_user:female_user_id(full_name, email)
        `)
        .eq('male_user_id', maleUser.id)
        .not('status', 'eq', 'disengaged')

      if (assignError) {
        console.log(`❌ Error fetching assignments: ${assignError.message}`)
        continue
      }

      console.log(`📊 Current assignments: ${assignments.length}`)
      
      if (assignments.length === 0) {
        console.log('   No assignments to test with')
        continue
      }

      // Display current state
      assignments.forEach((assignment, index) => {
        console.log(`   ${index + 1}. ${assignment.female_user.full_name} - Status: ${assignment.status}, Selected: ${assignment.is_selected || false}, Revealed: ${assignment.male_revealed || false}`)
      })

      // 3. Test the filtering logic that would be used in dashboard
      const selectedProfiles = assignments.filter(a => a.is_selected === true || a.status === 'selected')
      const availableProfiles = assignments.filter(a => !['hidden', 'disengaged', 'selected'].includes(a.status) && a.is_selected !== true)

      console.log(`\n🎯 Dashboard Logic Test:`)
      console.log(`   Selected profiles: ${selectedProfiles.length}`)
      console.log(`   Available profiles: ${availableProfiles.length}`)

      if (selectedProfiles.length > 0) {
        console.log(`   ✅ User has selected profile - would show only: ${selectedProfiles[0].female_user.full_name}`)
        console.log(`   🔒 Other profiles would be hidden from view`)
      } else if (availableProfiles.length > 0) {
        console.log(`   📋 User has no selection - would show ${availableProfiles.length} available profiles:`)
        availableProfiles.forEach((assignment, index) => {
          console.log(`      ${index + 1}. ${assignment.female_user.full_name} (${assignment.status})`)
        })
      } else {
        console.log(`   📭 No profiles to display`)
      }

      // 4. Test selection simulation if there are available profiles
      if (availableProfiles.length > 0 && selectedProfiles.length === 0) {
        const testAssignment = availableProfiles.find(a => a.male_revealed === true || a.status === 'revealed')
        
        if (testAssignment) {
          console.log(`\n🔬 Simulating selection of: ${testAssignment.female_user.full_name}`)
          
          // Simulate the selection process
          const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
          
          // Update as selected
          const { error: selectError } = await supabase
            .from('profile_assignments')
            .update({
              status: 'selected',
              is_selected: true,
              selected_at: new Date().toISOString(),
              timer_expires_at: expiresAt.toISOString()
            })
            .eq('id', testAssignment.id)

          if (selectError) {
            console.log(`❌ Selection simulation failed: ${selectError.message}`)
          } else {
            console.log(`✅ Profile marked as selected`)

            // Hide other profiles
            const otherAssignments = assignments.filter(a => a.id !== testAssignment.id && ['assigned', 'revealed'].includes(a.status))
            
            if (otherAssignments.length > 0) {
              const { error: hideError } = await supabase
                .from('profile_assignments')
                .update({ status: 'hidden' })
                .in('id', otherAssignments.map(a => a.id))

              if (hideError) {
                console.log(`❌ Failed to hide other profiles: ${hideError.message}`)
              } else {
                console.log(`🔒 Hidden ${otherAssignments.length} other profiles`)
              }
            }

            // Test the new state
            const { data: newAssignments } = await supabase
              .from('profile_assignments')
              .select(`
                id,
                status,
                is_selected,
                timer_expires_at,
                female_user:female_user_id(full_name)
              `)
              .eq('male_user_id', maleUser.id)
              .not('status', 'eq', 'disengaged')

            console.log(`\n📊 After selection:`)
            const newSelected = newAssignments.filter(a => a.is_selected === true || a.status === 'selected')
            const newAvailable = newAssignments.filter(a => !['hidden', 'disengaged', 'selected'].includes(a.status) && a.is_selected !== true)

            console.log(`   Selected profiles: ${newSelected.length}`)
            console.log(`   Available profiles: ${newAvailable.length}`)
            console.log(`   Hidden profiles: ${newAssignments.filter(a => a.status === 'hidden').length}`)

            if (newSelected.length === 1 && newAvailable.length === 0) {
              console.log(`✅ PERFECT! Dashboard would now show only: ${newSelected[0].female_user.full_name}`)
            } else {
              console.log(`❌ Logic issue detected - check the filtering`)
            }

            // Reset for next test
            console.log(`\n🔄 Resetting for next test...`)
            await supabase
              .from('profile_assignments')
              .update({
                status: 'assigned',
                is_selected: false,
                selected_at: null,
                timer_expires_at: null
              })
              .eq('male_user_id', maleUser.id)
          }
        } else {
          console.log(`   ⚠️  No revealed profiles to test selection with`)
        }
      }

      console.log(`\n${'='.repeat(60)}`)
    }

    console.log(`\n🎉 Dashboard selection flow test completed!`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testCompleteSelectionFlow()
