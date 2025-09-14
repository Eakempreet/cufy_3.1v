import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import React from 'react'
import { SessionProvider } from './components/SessionProvider'

export const metadata: Metadata = {
  title: 'Cufy - Matches Are Meant to Meet',
  description: 'Find genuine people, meaningful connections, and a chance to meet your perfect match.',
  keywords: 'dating app, matches, relationships, premium dating',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-dark text-white overflow-x-hidden">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6LTD8KG1KP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6LTD8KG1KP');
          `}
        </Script>
        
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}