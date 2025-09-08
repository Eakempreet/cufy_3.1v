import React, { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/Button'
import { Camera } from 'lucide-react'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  currentImage?: string
  className?: string
  uploadType?: 'profile-photo' | 'payment-proof'
  userId?: string
}

export default function ImageUpload({ onImageUploaded, currentImage, className = "", uploadType = 'profile-photo', userId }: ImageUploadProps) {
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

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB.')
      }

      let publicUrl: string

      if (uploadType === 'payment-proof') {
        // For payment proofs, use the API route for proper authentication
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/user/payment-proof', {
          method: 'POST',
          body: formData,
        })

        console.log('API Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('API Error response:', errorData)
          throw new Error(errorData.error || 'Failed to upload payment proof')
        }

        const result = await response.json()
        publicUrl = result.payment_proof_url
        
        // Convert filename to full URL if needed
        if (!publicUrl.startsWith('http')) {
          const { data } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(publicUrl)
          publicUrl = data.publicUrl
        }
      } else {
        // For profile photos, upload directly to storage (existing logic)
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `profile-photos/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file)

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const { data } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath)

        publicUrl = data.publicUrl
      }

      setPreviewUrl(publicUrl)
      onImageUploaded(publicUrl)

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
            <Image
              src={previewUrl}
              alt={uploadType === 'payment-proof' ? "Payment proof preview" : "Profile photo preview"}
              width={128}
              height={128}
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
              {uploading ? 'Uploading...' : previewUrl ? (uploadType === 'payment-proof' ? 'Change Proof' : 'Change Photo') : (uploadType === 'payment-proof' ? 'Upload Proof' : 'Upload Photo')}
            </Button>
          </label>
          <p className="text-sm text-white/60 text-center">
            {uploadType === 'payment-proof' ? 'Upload payment proof (max 5MB)' : 'Upload profile photo (max 5MB)'}<br />
            Supported: JPG, PNG, WebP, GIF
          </p>
        </div>
      </div>
    </div>
  )
}
