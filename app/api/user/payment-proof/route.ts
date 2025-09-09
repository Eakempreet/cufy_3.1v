import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user data first using admin client for RLS bypass
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, subscription_type, payment_proof_url')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      console.error('User fetch error:', userError)
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

    // Check if request is JSON (payment proof URL) or FormData (file upload)
    const contentType = request.headers.get('content-type')
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
          
          // Try to delete old file - use both admin and regular client for better compatibility
          const deleteOperations = [
            supabaseAdmin.storage.from('payment-proofs').remove([userData.payment_proof_url]),
            supabase.storage.from('payment-proofs').remove([userData.payment_proof_url])
          ]
          
          await Promise.allSettled(deleteOperations)
          console.log('Old payment proof deletion attempted')
        } catch (deleteError) {
          console.log('Error deleting old payment proof:', deleteError)
          // Don't fail the upload if delete fails
        }
      }
    } else {
      // Handle FormData file upload (legacy support)
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Please select an image file.' },
          { status: 400 }
        )
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image must be less than 10MB.' },
          { status: 400 }
        )
      }

      // Upload payment proof to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `payment_proof_${userData.id}_${Date.now()}.${fileExt}`
      
      // Delete old file first if it exists
      if (userData.payment_proof_url) {
        try {
          console.log('Deleting old payment proof file:', userData.payment_proof_url)
          
          // Try to delete with both clients
          const deleteOperations = [
            supabaseAdmin.storage.from('payment-proofs').remove([userData.payment_proof_url]),
            supabase.storage.from('payment-proofs').remove([userData.payment_proof_url])
          ]
          
          await Promise.allSettled(deleteOperations)
        } catch (deleteError) {
          console.log('Could not delete old payment proof:', deleteError)
        }
      }
      
      // Upload new file using admin client for better compatibility
      const { error: uploadError } = await supabaseAdmin.storage
        .from('payment-proofs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json(
          { error: `Failed to upload payment proof: ${uploadError.message}` },
          { status: 500 }
        )
      }

      paymentProofUrl = fileName
    }

    // Create or update payment record using admin client
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('user_id', userData.id)
      .single()

    let payment: any

    const paymentData = {
      user_id: userData.id,
      amount: userData.subscription_type === 'premium' ? 249 : 99,
      payment_method: 'upi',
      status: 'pending',
      subscription_type: userData.subscription_type,
      payment_proof_url: paymentProofUrl,
      updated_at: new Date().toISOString()
    }

    if (existingPayment) {
      // Update existing payment record
      const { data: updatedPayment, error: updateError } = await supabaseAdmin
        .from('payments')
        .update(paymentData)
        .eq('id', existingPayment.id)
        .select()
        .single()

      if (updateError) {
        console.error('Payment update error:', updateError)
        return NextResponse.json(
          { error: `Failed to update payment record: ${updateError.message}` },
          { status: 500 }
        )
      }

      payment = updatedPayment
    } else {
      // Create new payment record
      const { data: newPayment, error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (paymentError) {
        console.error('Payment record error:', paymentError)
        return NextResponse.json(
          { error: `Failed to create payment record: ${paymentError.message}` },
          { status: 500 }
        )
      }

      payment = newPayment
    }

    // Update user profile with payment proof URL using admin client
    const { error: updateUserError } = await supabaseAdmin
      .from('users')
      .update({ 
        payment_proof_url: paymentProofUrl,
        payment_confirmed: false, // Reset confirmation status for new proof
        subscription_status: 'pending'
      })
      .eq('id', userData.id)

    if (updateUserError) {
      console.error('User update error:', updateUserError)
      return NextResponse.json(
        { error: `Failed to update user profile: ${updateUserError.message}` },
        { status: 500 }
      )
    }

    console.log(`Payment proof updated successfully for user ${userData.id}: ${paymentProofUrl}`)

    return NextResponse.json({ 
      message: 'Payment proof uploaded successfully',
      payment,
      payment_proof_url: paymentProofUrl,
      success: true
    })
  } catch (error) {
    console.error('Payment proof upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
