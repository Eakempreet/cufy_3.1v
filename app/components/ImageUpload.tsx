import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from './ui/Button'
import { Camera } from 'lucide-react'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  currentImage?: string
  className?: string
}

export default function ImageUpload({ onImageUploaded, currentImage, className = "" }: ImageUploadProps) {
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

      const publicUrl = data.publicUrl
      setPreviewUrl(publicUrl)
      onImageUploaded(publicUrl)

    } catch (error: any) {
      alert(error.message)
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
              alt="Profile preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
            <Camera className="h-12 w-12 text-white/50" />
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
              className="cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Camera className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : previewUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </label>
          <p className="text-sm text-white/60 text-center">
            Upload a profile photo (max 5MB)<br />
            Supported: JPG, PNG, WebP, GIF
          </p>
        </div>
      </div>
    </div>
  )
}
