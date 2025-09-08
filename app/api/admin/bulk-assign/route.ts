import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { assignments, options = {} } = await request.json()
    
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json(
        { error: "Assignments array is required and cannot be empty" },
        { status: 400 }
      )
    }

    const { 
      skipValidation = false, 
      maxBatchSize = 100,
      skipExistingCheck = false
    } = options

    console.log(`🚀 Starting bulk assignment for ${assignments.length} assignments...`)
    const startTime = Date.now()

    // Process in batches if needed
    const batches = []
    for (let i = 0; i < assignments.length; i += maxBatchSize) {
      batches.push(assignments.slice(i, i + maxBatchSize))
    }

    let totalCreated = 0
    let totalSkipped = 0
    let errors = []

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} assignments...`)
      
      try {
        const result = await processBatch(batch, { skipValidation, skipExistingCheck })
        totalCreated += result.created
        totalSkipped += result.skipped
        if (result.errors) {
          errors.push(...result.errors)
        }
      } catch (error) {
        console.error(`❌ Batch ${batchIndex + 1} failed:`, error)
        errors.push(`Batch ${batchIndex + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    const duration = Date.now() - startTime
    console.log(`✅ Bulk assignment completed in ${duration}ms: ${totalCreated} created, ${totalSkipped} skipped`)

    return NextResponse.json({
      success: true,
      message: `Bulk assignment completed: ${totalCreated} assignments created`,
      stats: {
        totalRequested: assignments.length,
        totalCreated,
        totalSkipped,
        totalErrors: errors.length,
        durationMs: duration,
        assignmentsPerSecond: Math.round((totalCreated / duration) * 1000)
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error("Bulk assignment error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function processBatch(
  assignments: Array<{maleUserId: string, femaleUserId: string}>, 
  options: {skipValidation?: boolean, skipExistingCheck?: boolean}
) {
  const { skipValidation = false, skipExistingCheck = false } = options
  
  let validAssignments = assignments

  // Step 1: Validate users if not skipped
  if (!skipValidation) {
    const maleUserIds = Array.from(new Set(assignments.map(a => a.maleUserId)))
    
    const { data: validMaleUsers } = await supabaseAdmin
      .from("users")
      .select("id")
      .in("id", maleUserIds)
      .eq("payment_confirmed", true)
      .eq("subscription_status", "active")

    const validMaleUserIds = new Set(validMaleUsers?.map(u => u.id) || [])
    
    validAssignments = assignments.filter(a => validMaleUserIds.has(a.maleUserId))
    console.log(`✅ Validation: ${validAssignments.length}/${assignments.length} assignments have valid users`)
  }

  // Step 2: Check existing assignments if not skipped
  if (!skipExistingCheck && validAssignments.length > 0) {
    const { data: existingAssignments } = await supabaseAdmin
      .from("profile_assignments")
      .select("male_user_id, female_user_id")

    const existingPairs = new Set(
      existingAssignments?.map(a => `${a.male_user_id}-${a.female_user_id}`) || []
    )

    const originalCount = validAssignments.length
    validAssignments = validAssignments.filter(assignment => {
      const pairKey = `${assignment.maleUserId}-${assignment.femaleUserId}`
      return !existingPairs.has(pairKey)
    })
    
    console.log(`✅ Duplicate check: ${validAssignments.length}/${originalCount} assignments are unique`)
  }

  // Step 3: Bulk insert
  if (validAssignments.length === 0) {
    return { created: 0, skipped: assignments.length, errors: [] }
  }

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
    .select("id")

  if (insertError) {
    throw new Error(`Bulk insert failed: ${insertError.message}`)
  }

  const created = createdAssignments?.length || 0
  const skipped = assignments.length - created

  return { created, skipped, errors: [] }
}

// GET endpoint for bulk assignment status/stats
export async function GET() {
  try {
    const { data: stats } = await supabaseAdmin
      .from("profile_assignments")
      .select("status", { count: "exact" })

    const { data: userStats } = await supabaseAdmin
      .from("users")
      .select("gender, payment_confirmed, subscription_status", { count: "exact" })

    return NextResponse.json({
      assignmentStats: stats || [],
      userStats: userStats || [],
      bulkAssignmentEndpoint: "/api/admin/bulk-assign"
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
