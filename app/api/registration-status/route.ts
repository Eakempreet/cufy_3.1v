import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get only registration-related settings (public endpoint)
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['boys_registration_enabled', 'boys_registration_message', 'girls_registration_enabled'])

    if (error) {
      console.error('Error fetching registration status:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch registration status',
        // Default to enabled on error
        boys_registration_enabled: true,
        girls_registration_enabled: true,
        boys_registration_message: 'Boys registration will open soon! Girls can join now.'
      }, { status: 500 })
    }

    // Convert to key-value object
    const settingsObject: any = settings.reduce((acc: any, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {})

    return NextResponse.json({ 
      success: true,
      boys_registration_enabled: settingsObject.boys_registration_enabled !== false,
      girls_registration_enabled: settingsObject.girls_registration_enabled !== false,
      boys_registration_message: settingsObject.boys_registration_message || 'Boys registration will open soon! Girls can join now.',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Registration status GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      // Default to enabled on error
      boys_registration_enabled: true,
      girls_registration_enabled: true,
      boys_registration_message: 'Boys registration will open soon! Girls can join now.'
    }, { status: 500 })
  }
}
