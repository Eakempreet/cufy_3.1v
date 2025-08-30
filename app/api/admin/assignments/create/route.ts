import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user has paid and is eligible for assignment
    if (!user.payment_confirmed) {
      return NextResponse.json(
        { error: `Cannot assign profile to ${user.full_name}. Payment not yet confirmed.` },
        { status: 400 }
      )
    }

    if (user.subscription_type === 'none') {
      return NextResponse.json(
        { error: `Cannot assign profile to ${user.full_name}. No active subscription.` },
        { status: 400 }
      )
    }

    // Check if user already has an active assignment
    const { data: existingAssignment } = await supabaseAdmin
      .from("profile_assignments")
      .select("id")
      .or(`male_user_id.eq.${userId},female_user_id.eq.${userId}`)
      .eq("status", "assigned")
      .single()

    if (existingAssignment) {
      return NextResponse.json(
        { error: `${user.full_name} already has an active assignment` },
        { status: 400 }
      )
    }

    let compatibleUser = null

    if (user.gender === 'male') {
      // Find a compatible female user
      const { data: femaleUsers, error: femaleError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("gender", "female")
        .eq("payment_confirmed", true)
        .neq("subscription_type", "none")
        .not("id", "in", `(
          SELECT COALESCE(male_user_id, female_user_id) 
          FROM profile_assignments 
          WHERE status = 'assigned'
        )`)

      if (femaleError) {
        console.error("Error fetching female users:", femaleError)
        return NextResponse.json(
          { error: "Error finding compatible profiles" },
          { status: 500 }
        )
      }

      compatibleUser = femaleUsers?.[0]
    } else if (user.gender === 'female') {
      // Find a compatible male user
      const { data: maleUsers, error: maleError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("gender", "male")
        .eq("payment_confirmed", true)
        .neq("subscription_type", "none")
        .not("id", "in", `(
          SELECT COALESCE(male_user_id, female_user_id) 
          FROM profile_assignments 
          WHERE status = 'assigned'
        )`)

      if (maleError) {
        console.error("Error fetching male users:", maleError)
        return NextResponse.json(
          { error: "Error finding compatible profiles" },
          { status: 500 }
        )
      }

      compatibleUser = maleUsers?.[0]
    }

    if (!compatibleUser) {
      return NextResponse.json(
        { error: `No compatible ${user.gender === 'male' ? 'female' : 'male'} profiles available for assignment` },
        { status: 404 }
      )
    }

    // Create the assignment
    const assignmentData = {
      male_user_id: user.gender === 'male' ? userId : compatibleUser.id,
      female_user_id: user.gender === 'female' ? userId : compatibleUser.id,
      status: "assigned" as const,
      male_revealed: false,
      female_revealed: false,
      assigned_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from("profile_assignments")
      .insert(assignmentData)
      .select()
      .single()

    if (assignmentError) {
      console.error("Assignment creation error:", assignmentError)
      return NextResponse.json(
        { error: "Failed to create assignment" },
        { status: 500 }
      )
    }

    // Create a temporary match entry (48-hour window)
    const tempMatchData = {
      assignment_id: assignment.id,
      male_user_id: assignment.male_user_id,
      female_user_id: assignment.female_user_id,
      status: "active" as const,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
    }

    const { error: tempMatchError } = await supabaseAdmin
      .from("temporary_matches")
      .insert(tempMatchData)

    if (tempMatchError) {
      console.error("Temporary match creation error:", tempMatchError)
      // Don't fail the assignment if temp match creation fails
    }

    return NextResponse.json({ 
      success: true, 
      assignment,
      message: `Successfully assigned ${user.full_name} to ${compatibleUser.full_name}!`
    })
  } catch (error) {
    console.error("Auto assign error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
