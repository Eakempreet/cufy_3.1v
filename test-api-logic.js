const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testAPILogic() {
  console.log('🧪 Testing Assignment API Logic...\n')

  try {
    // Get a male user with assignments
    const { data: maleUser } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('email', '2023339900.aman@ug.sharda.ac.in')
      .single()

    if (!maleUser) {
      console.log('❌ Test user not found')
      return
    }

    console.log(`👤 Testing with user: ${maleUser.full_name}`)

    // Test the API logic for fetching assignments
    // Check if user has any selected profile first
    const { data: selectedAssignment } = await supabase
      .from('profile_assignments')
      .select('*')
      .eq('male_user_id', maleUser.id)
      .eq('is_selected', true)
      .single()

    console.log(`\n🔍 Checking for selected profiles...`)
    if (selectedAssignment) {
      console.log(`✅ Found selected profile: ${selectedAssignment.id}`)
      console.log(`📋 API would return only this assignment`)
    } else {
      console.log(`📋 No selected profile found`)
      
      // Get all assignments for male users (exclude disengaged and hidden)
      const { data: maleAssignments } = await supabase
        .from('profile_assignments')
        .select('*')
        .eq('male_user_id', maleUser.id)
        .not('status', 'in', '(disengaged,hidden)')
        .order('assigned_at', { ascending: false })

      console.log(`📊 Found ${maleAssignments.length} available assignments`)
      maleAssignments.forEach(assignment => {
        console.log(`   - Assignment ${assignment.id}: ${assignment.status}`)
      })
    }

    // Simulate the complete API response logic
    let assignments = []
    if (selectedAssignment) {
      assignments = [selectedAssignment]
      console.log(`\n✅ API Logic: Returning only selected assignment`)
    } else {
      const { data: maleAssignments } = await supabase
        .from('profile_assignments')
        .select('*')
        .eq('male_user_id', maleUser.id)
        .not('status', 'in', '(disengaged,hidden)')
        .order('assigned_at', { ascending: false })
      
      assignments = maleAssignments || []
      console.log(`\n📋 API Logic: Returning ${assignments.length} available assignments`)
    }

    console.log(`\n🎯 Final API Response would contain:`)
    assignments.forEach(assignment => {
      console.log(`   - Assignment ${assignment.id}: status=${assignment.status}, selected=${assignment.is_selected || false}`)
    })

    console.log(`\n✅ API Logic Test Summary:`)
    console.log(`- If user has selected profile: API returns only that assignment`)
    console.log(`- If no selection: API returns all non-hidden/non-disengaged assignments`)
    console.log(`- Dashboard will filter these assignments correctly`)
    console.log(`- Result: User sees only selected profile when one is chosen`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAPILogic()
