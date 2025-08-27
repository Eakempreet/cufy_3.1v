import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    if (!userData.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate phone number
    if (!userData.phone_number || userData.phone_number.length !== 10 || !/^\d+$/.test(userData.phone_number)) {
      return NextResponse.json({ error: 'Phone number must be exactly 10 digits' }, { status: 400 })
    }

    // Validate age
    if (!userData.age || userData.age < 18 || userData.age > 25) {
      return NextResponse.json({ error: 'Age must be between 18 and 25' }, { status: 400 })
    }

    // Validate required fields
    const requiredFields = ['full_name', 'university', 'year_of_study', 'gender']
    for (const field of requiredFields) {
      if (!userData[field] || userData[field].trim() === '') {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      
      // Handle specific constraint violations
      if (error.code === '23505' && error.message.includes('email')) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
      }
      
      if (error.code === '23514') {
        return NextResponse.json({ error: 'Invalid data provided. Please check your inputs.' }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to create user profile. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ user: data }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
