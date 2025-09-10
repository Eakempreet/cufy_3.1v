'use client'

import { useState, useEffect } from 'react'

export default function AdminMatchesPanel() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="text-white p-4">
        <h1>Admin Matches Panel</h1>
        <p>This is a minimal working version</p>
      </div>
    </div>
  )
}
