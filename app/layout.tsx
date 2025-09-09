import './globals.css'
import type { Metadata } from 'next'
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
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}