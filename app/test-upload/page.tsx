'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ImageUpload from '../components/ImageUpload'

export default function TestUpload() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    console.log('Image uploaded:', imageUrl)
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Test Image Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUpload onImageUploaded={handleImageUpload} />
            
            {uploadedImage && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Uploaded Image:</h3>
                <div className="relative w-full max-w-md">
                  <Image 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    width={400}
                    height={300}
                    className="rounded-lg border border-white/20"
                  />
                </div>
                <p className="text-white/70 text-sm break-all">
                  URL: {uploadedImage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
