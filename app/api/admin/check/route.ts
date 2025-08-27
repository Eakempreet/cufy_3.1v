import { NextRequest, NextResponse } from 'next/server'

const ADMIN_EMAILS = [
  'admin@cufy.com',
  'cufy.online@gmail.com',
  'amansinghal.personal@gmail.com',
  // Add more admin emails here
]

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase())

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
