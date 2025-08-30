import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Registration Status API Called ===')
    
    // Get only registration-related settings (public endpoint)
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('setting_key, setting_value, updated_at')
      .in('setting_key', ['boys_registration_enabled', 'boys_registration_message', 'girls_registration_enabled'])
      .order('updated_at', { ascending: false })

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

    console.log('Raw settings from database:', settings)

    // Convert to key-value object and handle boolean conversion properly
    const settingsObject: any = settings.reduce((acc: any, setting) => {
      let value = setting.setting_value
      
      // Handle boolean conversion for string values
      if (setting.setting_key.includes('_enabled')) {
        if (value === 'false' || value === false || value === 'False') {
          value = false
        } else if (value === 'true' || value === true || value === 'True') {
          value = true
        }
      }
      
      acc[setting.setting_key] = value
      return acc
    }, {})

    console.log('Processed settings object:', settingsObject)

    const result = { 
      success: true,
      boys_registration_enabled: settingsObject.boys_registration_enabled === true,
      girls_registration_enabled: settingsObject.girls_registration_enabled !== false,
      boys_registration_message: settingsObject.boys_registration_message || 'Boys registration will open soon! Girls can join now.',
      timestamp: new Date().toISOString(),
      raw_settings: settings, // For debugging
      processed_settings: settingsObject // For debugging
    }

    console.log('Final API response:', result)

    // Add cache headers to prevent Vercel caching
    const response = NextResponse.json(result)
    
    // Prevent caching on Vercel
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    response.headers.set('CDN-Cache-Control', 'no-store')
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store')
    
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
