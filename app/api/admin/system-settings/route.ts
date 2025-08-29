import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get system settings (public endpoint for checking registration status)
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .order('setting_key')

    if (error) {
      console.error('Error fetching system settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Convert to key-value object for easier access
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {})

    return NextResponse.json({ 
      success: true, 
      settings: settingsObject,
      raw_settings: settings 
    })

  } catch (error) {
    console.error('System settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('email', session.user.email)
      .single()

    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { setting_key, setting_value, description } = await request.json()

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json(
        { error: 'setting_key and setting_value are required' },
        { status: 400 }
      )
    }

    // Update or insert setting
    // First try to update, if no rows affected, then insert
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('system_settings')
      .update({
        setting_value,
        description: description || null,
        updated_by: session.user.email,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', setting_key)
      .select()

    if (updateError) {
      console.error('Error updating system setting:', updateError)
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
    }

    let data = updateData

    // If no rows were updated, insert a new row
    if (!updateData || updateData.length === 0) {
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('system_settings')
        .insert({
          setting_key,
          setting_value,
          description: description || null,
          updated_by: session.user.email
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting system setting:', insertError)
        return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 })
      }

      data = [insertData]
    }

    return NextResponse.json({ 
      success: true, 
      setting: data[0],
      message: `Setting '${setting_key}' updated successfully`
    })

  } catch (error) {
    console.error('System settings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('email', session.user.email)
      .single()

    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { action, setting_key, setting_value } = await request.json()

    if (action === 'toggle_boys_registration') {
      // Toggle boys registration
      const { data: currentSetting } = await supabaseAdmin
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'boys_registration_enabled')
        .single()

      const newValue = currentSetting?.setting_value === true ? false : true

      // Use update instead of upsert to avoid constraint issues
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .update({
          setting_value: newValue,
          updated_by: session.user.email,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'boys_registration_enabled')
        .select()
        .single()

      if (error) {
        console.error('Error toggling boys registration:', error)
        return NextResponse.json({ error: 'Failed to toggle setting' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        setting: data,
        message: `Boys registration ${newValue ? 'enabled' : 'disabled'}`,
        new_value: newValue
      })
    }

    if (action === 'update_message') {
      // Update boys registration message
      const { data, error } = await supabaseAdmin
        .from('system_settings')
        .update({
          setting_value: setting_value,
          updated_by: session.user.email,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'boys_registration_message')
        .select()
        .single()

      if (error) {
        console.error('Error updating boys registration message:', error)
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        setting: data,
        message: 'Boys registration message updated successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('System settings POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
