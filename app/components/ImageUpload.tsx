import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from './ui/Button'
import { Camera } from 'lucide-react'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  currentImage?: string
  className?: string
  uploadType?: 'profile' | 'payment-proof'
  userId?: string
}

export default function ImageUpload({ 
  onImageUploaded, 
  currentImage, 
  className = "",
  uploadType = 'profile',
  userId
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file.')
      }

      // Validate file size (10MB limit for payment proofs, 5MB for profile photos)
      const maxSize = uploadType === 'payment-proof' ? 10 * 1024 * 1024 : 5 * 1024 * 1024
      if (file.size > maxSize) {
        const maxSizeMB = uploadType === 'payment-proof' ? 10 : 5
        throw new Error(`Image must be less than ${maxSizeMB}MB.`)
      }

      const fileExt = file.name.split('.').pop()
      let fileName: string
      let bucketName: string
      
      if (uploadType === 'payment-proof' && userId) {
        // For payment proofs, use user-specific naming to allow easy replacement
        fileName = `payment_proof_${userId}_${Date.now()}.${fileExt}`
        bucketName = 'payment-proofs'
      } else {
        // For profile photos, use random naming
        fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        bucketName = 'profile-photos'
      }
      
      const filePath = uploadType === 'payment-proof' ? fileName : `profile-photos/${fileName}`

      if (uploadType === 'payment-proof') {
        // For payment proofs, use API route to bypass RLS issues
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/user/payment-proof', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Payment proof upload failed')
        }

        const result = await response.json()
        
        // For payment proofs, return just the filename to be stored in DB
        setPreviewUrl(URL.createObjectURL(file)) // Local preview
        onImageUploaded(result.payment_proof_url)
        console.log('Payment proof uploaded successfully via API:', result.payment_proof_url)
      } else {
        // For profile photos, upload directly to storage
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // For profile photos, return the full public URL
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        const publicUrl = data.publicUrl
        setPreviewUrl(publicUrl)
        onImageUploaded(publicUrl)
        console.log('Profile photo uploaded successfully:', publicUrl)
      }

    } catch (error: any) {
      console.error('Image upload error:', error)
      alert(error.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={uploadType === 'payment-proof' ? 'Payment proof preview' : 'Profile photo preview'}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg object-cover border-4 border-white shadow-lg"
            />
          </div>
        ) : (
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
            <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-white/50" />
          </div>
        )}
        
        <div className="flex flex-col items-center space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              disabled={uploading}
              onClick={() => document.getElementById('image-upload')?.click()}
              className="cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 min-h-[44px] px-4 sm:px-6"
            >
              <Camera className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : previewUrl ? 'Change Photo' : 
                (uploadType === 'payment-proof' ? 'Upload Payment Proof' : 'Upload Photo')}
            </Button>
          </label>
          <p className="text-sm text-white/60 text-center">
            {uploadType === 'payment-proof' ? 
              'Upload payment proof (max 5MB)' : 
              'Upload profile photo (max 5MB)'
            }<br />
            Supported: JPG, PNG, WebP, GIF
          </p>
        </div>
      </div>
    </div>
  )
}
