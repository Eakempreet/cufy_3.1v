import LandingPage from './components/LandingPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cufy - The #1 College Dating Platform in India | Find Your Perfect Match',
  description: 'Join 10,000+ college students on India\'s most trusted dating platform. Find genuine relationships, study partners, and your soulmate with verified profiles. Free to join!',
  keywords: [
    'college dating India',
    'student dating app',
    'university dating platform',
    'college relationships',
    'verified student profiles',
    'dating app for college students',
    'Indian college dating'
  ],
  openGraph: {
    title: 'Cufy - The #1 College Dating Platform in India',
    description: 'Join 10,000+ college students on India\'s most trusted dating platform. Find genuine relationships with verified profiles.',
    url: 'https://cufy.online',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Cufy College Dating Platform - Connect with verified students',
      },
    ],
  },
  twitter: {
    title: 'Cufy - The #1 College Dating Platform in India',
    description: 'Join 10,000+ college students on India\'s most trusted dating platform. Find genuine relationships with verified profiles.',
    images: ['/twitter-home.jpg'],
  },
  alternates: {
    canonical: 'https://cufy.online',
  },
}

export default function Home() {
  return <LandingPage />
}