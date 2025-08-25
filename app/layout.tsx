import './globals.css'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { SessionProvider } from './components/SessionProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'Cufy - Matches Are Meant to Meet',
  description: 'Find genuine people, meaningful connections, and a chance to meet your perfect match.',
  keywords: 'dating app, matches, relationships, premium dating',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-inter bg-dark text-white overflow-x-hidden`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}