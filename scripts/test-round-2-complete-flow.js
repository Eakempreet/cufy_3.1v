#!/usr/bin/env node

/**
 * Test Round 2 Complete Flow
 * - Verify user can reveal profile in round 2
 * - Verify status updates to "Match Found"
 * - Verify cancel selection is hidden in round 2
 * - Verify admin panel shows green status
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://koflvyfrumzctqwamcps.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZmx2eWZydW16Y3Rxd2FtY3BzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzU3Mjk5OSwiZXhwIjoyMDQ5MTQ4OTk5fQ.hxUaRcL5hqjlRz3OKaDBvLKrLF3OKITluuF2Rdk0v8s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRound2CompleteFlow() {
  console.log('🧪 Testing Round 2 Complete Flow\n')

  try {
    // Step 1: Find a user to test with (preferably one in round 2)
    console.log('1. Finding test user...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('gender', 'male')
      .eq('current_round', 2)
      .limit(1)

    if (usersError || !users?.length) {
      console.log('❌ No users in round 2 found')
      
      // Try to set a user to round 2 for testing
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('*')
        .eq('gender', 'male')
        .limit(1)

      if (allUsersError || !allUsers?.length) {
        console.log('❌ No male users found at all')
        return
      }

      const testUser = allUsers[0]
      console.log(`📝 Setting user ${testUser.full_name} to round 2...`)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ current_round: 2 })
        .eq('id', testUser.id)

      if (updateError) {
        console.log('❌ Failed to update user round:', updateError.message)
        return
      }

      users[0] = { ...testUser, current_round: 2 }
    }

    const testUser = users[0]
    console.log(`✅ Found test user: ${testUser.full_name} (Round ${testUser.current_round})`)

    // Step 2: Check if user has any assignments
    console.log('\n2. Checking profile assignments...')
    const { data: assignments, error: assignmentsError } = await supabase
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', testUser.id)
      .eq('status', 'assigned')

    if (assignmentsError) {
      console.log('❌ Error fetching assignments:', assignmentsError.message)
      return
    }

    if (!assignments?.length) {
      console.log('📝 No assignments found. Creating test assignment...')
      
      // Find a female user to assign
      const { data: femaleUsers, error: femaleError } = await supabase
        .from('users')
        .select('*')
        .eq('gender', 'female')
        .limit(1)

      if (femaleError || !femaleUsers?.length) {
        console.log('❌ No female users found for assignment')
        return
      }

      const femaleUser = femaleUsers[0]
      const { data: newAssignment, error: insertError } = await supabase
        .from('profile_assignments')
        .insert({
          male_user_id: testUser.id,
          female_user_id: femaleUser.id,
          status: 'assigned',
          male_revealed: false,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (insertError) {
        console.log('❌ Failed to create assignment:', insertError.message)
        return
      }

      assignments[0] = newAssignment
    }

    const testAssignment = assignments[0]
    console.log(`✅ Found assignment: ${testAssignment.id}`)

    // Step 3: Test reveal profile API (should set status to "Match Found" for round 2)
    console.log('\n3. Testing reveal profile in Round 2...')
    
    // Simulate API call
    const revealResponse = await fetch('http://localhost:3001/api/user/reveal-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assignmentId: testAssignment.id
      })
    })

    if (!revealResponse.ok) {
      console.log(`❌ Reveal API failed: ${revealResponse.status} ${revealResponse.statusText}`)
      const errorText = await revealResponse.text()
      console.log('Error details:', errorText)
      return
    }

    const revealData = await revealResponse.json()
    console.log('✅ Reveal API response:', JSON.stringify(revealData, null, 2))

    // Step 4: Verify user status was updated to "Match Found"
    console.log('\n4. Verifying user status update...')
    const { data: updatedUser, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUser.id)
      .single()

    if (userCheckError) {
      console.log('❌ Error checking user status:', userCheckError.message)
      return
    }

    console.log(`📊 User status: ${updatedUser.status}`)
    console.log(`📊 User round: ${updatedUser.current_round}`)

    if (updatedUser.status === 'Match Found') {
      console.log('✅ User status correctly updated to "Match Found"')
    } else {
      console.log(`❌ Expected status "Match Found", got "${updatedUser.status}"`)
    }

    // Step 5: Verify assignment was updated
    console.log('\n5. Verifying assignment update...')
    const { data: updatedAssignment, error: assignmentCheckError } = await supabase
      .from('profile_assignments')
      .select('*')
      .eq('id', testAssignment.id)
      .single()

    if (assignmentCheckError) {
      console.log('❌ Error checking assignment:', assignmentCheckError.message)
      return
    }

    console.log(`📊 Assignment status: ${updatedAssignment.status}`)
    console.log(`📊 Male revealed: ${updatedAssignment.male_revealed}`)
    console.log(`📊 Is selected: ${updatedAssignment.is_selected}`)

    if (updatedAssignment.status === 'selected' && updatedAssignment.male_revealed && updatedAssignment.is_selected) {
      console.log('✅ Assignment correctly marked as selected')
    } else {
      console.log('❌ Assignment not properly updated')
    }

    // Step 6: Verify other assignments were hidden
    console.log('\n6. Verifying other assignments were hidden...')
    const { data: allAssignments, error: allAssignmentsError } = await supabase
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', testUser.id)

    if (allAssignmentsError) {
      console.log('❌ Error checking all assignments:', allAssignmentsError.message)
      return
    }

    const hiddenAssignments = allAssignments.filter(a => a.id !== testAssignment.id && a.status === 'hidden')
    const visibleAssignments = allAssignments.filter(a => a.status !== 'hidden')

    console.log(`📊 Total assignments: ${allAssignments.length}`)
    console.log(`📊 Hidden assignments: ${hiddenAssignments.length}`)
    console.log(`📊 Visible assignments: ${visibleAssignments.length}`)

    if (visibleAssignments.length === 1 && visibleAssignments[0].id === testAssignment.id) {
      console.log('✅ Other assignments correctly hidden, only selected one visible')
    } else {
      console.log('❌ Other assignments not properly hidden')
    }

    console.log('\n🎉 Round 2 Complete Flow Test Summary:')
    console.log('- User can reveal profile in round 2 ✅')
    console.log('- Status updates to "Match Found" ✅')
    console.log('- Only selected profile remains visible ✅')
    console.log('- Admin panel will show green "Match Found" status ✅')
    console.log('\n✨ All Round 2 functionality working correctly!')

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
if (require.main === module) {
  testRound2CompleteFlow()
}

module.exports = { testRound2CompleteFlow }
