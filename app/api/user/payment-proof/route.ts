import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if request is JSON (payment proof URL) or FormData (file upload)
    const contentType = request.headers.get('content-type')
    let paymentProofUrl: string

    if (contentType?.includes('application/json')) {
      // Handle JSON request with payment proof URL
      const { payment_proof_url } = await request.json()
      
      if (!payment_proof_url) {
        return NextResponse.json(
          { error: 'No payment proof URL provided' },
          { status: 400 }
        )
      }
      
      paymentProofUrl = payment_proof_url
    } else {
      // Handle FormData file upload
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      }

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single()

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Upload payment proof to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `payment_proof_${userData.id}_${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload payment proof' },
          { status: 500 }
        )
      }

      paymentProofUrl = fileName
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, subscription_type, payment_proof_url')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!userData.subscription_type) {
      return NextResponse.json(
        { error: 'No subscription selected' },
        { status: 400 }
      )
    }

    // If user has existing payment proof and this is a file upload, delete the old one
    if (userData.payment_proof_url && !contentType?.includes('application/json')) {
      try {
        await supabase.storage
          .from('payment-proofs')
          .remove([userData.payment_proof_url])
      } catch (deleteError) {
        console.log('Could not delete old payment proof:', deleteError)
        // Don't fail the upload if delete fails
      }
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userData.id,
        amount: userData.subscription_type === 'premium' ? 249 : 99,
        payment_method: 'upi',
        status: 'pending',
        subscription_type: userData.subscription_type,
        payment_proof_url: paymentProofUrl
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment record error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // Also update user profile with payment proof URL for admin convenience
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ payment_proof_url: paymentProofUrl })
      .eq('id', userData.id)

    if (updateUserError) {
      console.error('User update error:', updateUserError)
    }

    return NextResponse.json({ 
      message: 'Payment proof uploaded successfully',
      payment
    })
  } catch (error) {
    console.error('Payment proof upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
