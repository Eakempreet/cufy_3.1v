import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { maleUserId, femaleUserId } = await request.json()

    if (!maleUserId || !femaleUserId) {
      return NextResponse.json(
        { error: "Both male and female user IDs are required" },
        { status: 400 }
      )
    }

    // Check if male user has confirmed payment
    const { data: maleUser, error: maleUserError } = await supabaseAdmin
      .from("users")
      .select("payment_confirmed, subscription_status, full_name")
      .eq("id", maleUserId)
      .single()

    if (maleUserError || !maleUser) {
      return NextResponse.json(
        { error: "Male user not found" },
        { status: 404 }
      )
    }

    if (!maleUser.payment_confirmed) {
      return NextResponse.json(
        { error: `Cannot assign profile to ${maleUser.full_name}. Payment not yet confirmed.` },
        { status: 400 }
      )
    }

    if (maleUser.subscription_status !== 'active') {
      return NextResponse.json(
        { error: `Cannot assign profile to ${maleUser.full_name}. Subscription is not active.` },
        { status: 400 }
      )
    }

    // Check if assignment already exists
    const { data: existingAssignment } = await supabaseAdmin
      .from("profile_assignments")
      .select("id")
      .eq("male_user_id", maleUserId)
      .eq("female_user_id", femaleUserId)
      .single()

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Assignment already exists between these users" },
        { status: 400 }
      )
    }

    // Create the assignment with the new schema structure
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
      return NextResponse.json(
        { error: "Failed to create assignment" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      assignment,
      message: "Profile assigned successfully" 
    })
  } catch (error) {
    console.error("Assign profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
