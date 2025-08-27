import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let query = supabase
      .from('subscriptions')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data: subscriptions, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (type && subscriptions?.length > 0) {
      return NextResponse.json({ subscription: subscriptions[0] })
    }

    return NextResponse.json({ subscriptions: subscriptions || [] })
  } catch (error) {
    console.error('Subscriptions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
