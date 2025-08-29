import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Test if the required columns exist
    const { data: testQuery, error } = await supabaseAdmin
      .from('profile_assignments')
      .select('id, status, male_revealed, female_revealed, revealed_at')
      .limit(1)

    if (error) {
      return NextResponse.json({
        error: 'Database schema not ready',
        details: error.message,
        needsMigration: true
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema is ready',
      columnsExist: true
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      needsMigration: true
    }, { status: 500 })
  }
}
