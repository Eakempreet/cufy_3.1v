import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { maleUserId, femaleUserId, bulk = false, assignments = [] } = await request.json()

    // Handle bulk assignment
    if (bulk && assignments.length > 0) {
      return await handleBulkAssignment(assignments)
    }

    // Handle single assignment
    if (!maleUserId || !femaleUserId) {
      return NextResponse.json(
        { error: "Both male and female user IDs are required" },
        { status: 400 }
      )
    }

    const result = await createSingleAssignment(maleUserId, femaleUserId)
    return result

  } catch (error) {
    console.error("Assign profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function handleBulkAssignment(assignments: Array<{maleUserId: string, femaleUserId: string}>) {
  try {
    console.log(`🚀 Starting bulk assignment for ${assignments.length} assignments...`)
    
    // Batch validate all users at once
    const maleUserIds = Array.from(new Set(assignments.map(a => a.maleUserId)))
    const femaleUserIds = Array.from(new Set(assignments.map(a => a.femaleUserId)))
    
    const { data: validMaleUsers, error: maleError } = await supabaseAdmin
      .from("users")
      .select("id, payment_confirmed, subscription_status, full_name")
      .in("id", maleUserIds)
      .eq("payment_confirmed", true)
      .eq("subscription_status", "active")

    if (maleError) {
      throw new Error(`Male users validation failed: ${maleError.message}`)
    }

    const validMaleUserIds = new Set(validMaleUsers?.map(u => u.id) || [])
    
    // Check existing assignments in batch
    const { data: existingAssignments } = await supabaseAdmin
      .from("profile_assignments")
      .select("male_user_id, female_user_id")

    const existingPairs = new Set(
      existingAssignments?.map(a => `${a.male_user_id}-${a.female_user_id}`) || []
    )

    // Filter valid assignments
    const validAssignments = assignments.filter(assignment => {
      const isValidMale = validMaleUserIds.has(assignment.maleUserId)
      const pairKey = `${assignment.maleUserId}-${assignment.femaleUserId}`
      const isUnique = !existingPairs.has(pairKey)
      
      return isValidMale && isUnique
    })

    if (validAssignments.length === 0) {
      return NextResponse.json(
        { error: "No valid assignments to create", validCount: 0, totalCount: assignments.length },
        { status: 400 }
      )
    }

    // Bulk insert all valid assignments
    const assignmentData = validAssignments.map(assignment => ({
      male_user_id: assignment.maleUserId,
      female_user_id: assignment.femaleUserId,
      status: "assigned" as const,
      male_revealed: false,
      female_revealed: false,
      assigned_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { data: createdAssignments, error: insertError } = await supabaseAdmin
      .from("profile_assignments")
      .insert(assignmentData)
      .select()

    if (insertError) {
      throw new Error(`Bulk insert failed: ${insertError.message}`)
    }

    console.log(`✅ Bulk assignment completed: ${createdAssignments?.length || 0}/${assignments.length} assignments created`)

    return NextResponse.json({ 
      success: true, 
      message: `Bulk assignment completed: ${createdAssignments?.length || 0} assignments created`,
      validCount: createdAssignments?.length || 0,
      totalCount: assignments.length,
      skippedCount: assignments.length - (createdAssignments?.length || 0)
    })

  } catch (error) {
    console.error("Bulk assignment error:", error)
    return NextResponse.json({ 
      error: `Bulk assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      validCount: 0,
      totalCount: assignments.length
    }, { status: 500 })
  }
}

async function createSingleAssignment(maleUserId: string, femaleUserId: string) {
  // Check if male user has confirmed payment (optimized single query)
  const { data: maleUser, error: maleUserError } = await supabaseAdmin
    .from("users")
    .select("payment_confirmed, subscription_status, full_name")
    .eq("id", maleUserId)
    .single()

  if (maleUserError || !maleUser) {
    return NextResponse.json({ error: "Male user not found" }, { status: 404 })
  }

  if (!maleUser.payment_confirmed) {
    return NextResponse.json({ 
      error: `Cannot assign profile to ${maleUser.full_name}. Payment not yet confirmed.`
    }, { status: 400 })
  }

  if (maleUser.subscription_status !== 'active') {
    return NextResponse.json({ 
      error: `Cannot assign profile to ${maleUser.full_name}. Subscription is not active.`
    }, { status: 400 })
  }

  // Check if assignment already exists (optimized)
  const { data: existingAssignment } = await supabaseAdmin
    .from("profile_assignments")
    .select("id")
    .eq("male_user_id", maleUserId)
    .eq("female_user_id", femaleUserId)
    .maybeSingle()

  if (existingAssignment) {
    return NextResponse.json({ 
      error: "Assignment already exists between these users"
    }, { status: 400 })
  }

  // Create the assignment
  const assignmentData = {
    male_user_id: maleUserId,
    female_user_id: femaleUserId,
    status: "assigned" as const,
    male_revealed: false,
    female_revealed: false,
    assigned_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: assignment, error } = await supabaseAdmin
    .from("profile_assignments")
    .insert(assignmentData)
    .select()
    .single()

  if (error) {
    console.error("Assignment creation error:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    assignment,
    message: "Profile assigned successfully" 
  })
}
