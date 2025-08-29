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

    // Convert to key-value object and handle boolean conversion properly
    const settingsObject: any = settings.reduce((acc: any, setting) => {
      let value = setting.setting_value
      
      // Handle boolean conversion for string values
      if (setting.setting_key.includes('_enabled')) {
        if (value === 'false' || value === false) {
          value = false
        } else if (value === 'true' || value === true) {
          value = true
        }
      }
      
      acc[setting.setting_key] = value
      return acc
    }, {})

    // Add cache headers to prevent Vercel caching
    const response = NextResponse.json({ 
      success: true,
      boys_registration_enabled: settingsObject.boys_registration_enabled === true,
      girls_registration_enabled: settingsObject.girls_registration_enabled !== false,
      boys_registration_message: settingsObject.boys_registration_message || 'Boys registration will open soon! Girls can join now.',
      timestamp: new Date().toISOString(),
      raw_settings: settings, // For debugging
      processed_settings: settingsObject // For debugging
    })
    
    // Prevent caching on Vercel
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response

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
