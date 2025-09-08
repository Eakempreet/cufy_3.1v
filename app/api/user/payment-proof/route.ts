import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== PAYMENT PROOF API CALLED ===')
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.email)
    
    if (!session?.user?.email) {
      console.log('No session found, returning unauthorized')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user data first
    console.log('Looking up user with email:', session.user.email)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, subscription_type, payment_proof_url')
      .eq('email', session.user.email)
      .single()

    console.log('User data:', userData)
    console.log('User error:', userError)

    if (userError || !userData) {
      console.log('User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!userData.subscription_type) {
      console.log('No subscription type found for user')
      return NextResponse.json(
        { error: 'No subscription selected' },
        { status: 400 }
      )
    }

    // Check if request is JSON (payment proof URL) or FormData (file upload)
    const contentType = request.headers.get('content-type')
    console.log('Content type:', contentType)
    let paymentProofUrl: string

    if (contentType?.includes('application/json')) {
      // Handle JSON request with payment proof URL from ImageUpload component
      const { payment_proof_url } = await request.json()
      
      if (!payment_proof_url) {
        return NextResponse.json(
          { error: 'No payment proof URL provided' },
          { status: 400 }
        )
      }
      
      paymentProofUrl = payment_proof_url
      
      // If user has existing payment proof, delete the old one from storage
      if (userData.payment_proof_url && userData.payment_proof_url !== paymentProofUrl) {
        try {
          console.log('Deleting old payment proof:', userData.payment_proof_url)
          const { error: deleteError } = await supabaseAdmin.storage
            .from('payment-proofs')
            .remove([userData.payment_proof_url])
          
          if (deleteError) {
            console.log('Could not delete old payment proof:', deleteError)
          } else {
            console.log('Successfully deleted old payment proof')
          }
        } catch (deleteError) {
          console.log('Error deleting old payment proof:', deleteError)
          // Don't fail the upload if delete fails
        }
      }
    } else {
      // Handle FormData file upload (legacy support)
      console.log('Handling FormData file upload')
      const formData = await request.formData()
      const file = formData.get('file') as File
      console.log('File received:', file?.name, file?.size, file?.type)
      
      if (!file) {
        console.log('No file found in FormData')
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      }

      // Upload payment proof to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `payment_proof_${userData.id}_${Date.now()}.${fileExt}`
      
      // Delete old file first if it exists
      if (userData.payment_proof_url) {
        try {
          console.log('Deleting old payment proof:', userData.payment_proof_url)
          await supabaseAdmin.storage
            .from('payment-proofs')
            .remove([userData.payment_proof_url])
        } catch (deleteError) {
          console.log('Could not delete old payment proof:', deleteError)
        }
      }
      
      console.log('Uploading file to payment-proofs bucket:', fileName)
      const { error: uploadError } = await supabaseAdmin.storage
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

    // Create payment record (replace old one or create new)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', userData.id)
      .single()

    let payment: any

    if (existingPayment) {
      // Update existing payment record
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          amount: userData.subscription_type === 'premium' ? 249 : 99,
          payment_method: 'upi',
          status: 'pending',
          subscription_type: userData.subscription_type,
          payment_proof_url: paymentProofUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPayment.id)
        .select()
        .single()

      if (updateError) {
        console.error('Payment update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update payment record' },
          { status: 500 }
        )
      }

      payment = updatedPayment
    } else {
      // Create new payment record
      const { data: newPayment, error: paymentError } = await supabase
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

      payment = newPayment
    }

    // Update user profile with payment proof URL
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ 
        payment_proof_url: paymentProofUrl,
        payment_confirmed: false, // Reset confirmation status for new proof
        subscription_status: 'pending'
      })
      .eq('id', userData.id)

    if (updateUserError) {
      console.error('User update error:', updateUserError)
    }

    console.log(`Payment proof updated successfully for user ${userData.id}: ${paymentProofUrl}`)

    return NextResponse.json({ 
      message: 'Payment proof uploaded successfully',
      payment,
      payment_proof_url: paymentProofUrl
    })
  } catch (error) {
    console.error('Payment proof upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
