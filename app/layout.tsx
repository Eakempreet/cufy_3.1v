import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import React from 'react'
import { SessionProvider } from './components/SessionProvider'
import { WebVitals } from './components/WebVitals'

export const metadata: Metadata = {
  metadataBase: new URL('https://cufy.online'),
  title: {
    default: 'Cufy - The #1 College Dating Platform in India | Find Your Perfect Match',
    template: '%s | Cufy - College Dating Platform'
  },
  description: 'India\'s premier college dating app connecting genuine students. Find meaningful relationships, study partners, and your perfect match with verified college profiles. Join 10,000+ students today!',
  keywords: [
    'college dating app India',
    'college dating platform',
    'student dating app',
    'university dating',
    'college relationships',
    'student matches',
    'college romance',
    'verified student profiles',
    'college networking',
    'student community',
    'dating app for students',
    'college social app'
  ],
  authors: [{ name: 'Cufy Team' }],
  creator: 'Cufy',
  publisher: 'Cufy',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://cufy.online',
    siteName: 'Cufy - College Dating Platform',
    title: 'Cufy - The #1 College Dating Platform in India',
    description: 'India\'s premier college dating app connecting genuine students. Find meaningful relationships, study partners, and your perfect match with verified college profiles.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cufy - College Dating Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cufy - The #1 College Dating Platform in India',
    description: 'India\'s premier college dating app connecting genuine students. Find meaningful relationships and your perfect match.',
    images: ['/twitter-image.jpg'],
    creator: '@cufyapp',
    site: '@cufyapp',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  verification: {
    google: 'google-site-verification-token', // You'll need to add your actual verification token
    // yandex: 'yandex-verification-token',
    // bing: 'bing-verification-token',
  },
  alternates: {
    canonical: 'https://cufy.online',
  },
  category: 'Social Networking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://cufy.online/#website",
        "url": "https://cufy.online",
        "name": "Cufy - College Dating Platform",
        "description": "India's premier college dating app connecting genuine students",
        "publisher": {
          "@id": "https://cufy.online/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://cufy.online/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://cufy.online/#organization",
        "name": "Cufy",
        "url": "https://cufy.online",
        "logo": {
          "@type": "ImageObject",
          "url": "https://cufy.online/logo.png",
          "width": 512,
          "height": 512
        },
        "sameAs": [
          "https://twitter.com/cufyapp",
          "https://instagram.com/cufyapp",
          "https://linkedin.com/company/cufy"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-XXXXXXXXXX",
          "contactType": "customer service",
          "availableLanguage": ["English", "Hindi"]
        }
      },
      {
        "@type": "WebApplication",
        "name": "Cufy College Dating App",
        "url": "https://cufy.online",
        "applicationCategory": "SocialNetworkingApplication",
        "operatingSystem": "Web, iOS, Android",
        "offers": {
          "@type": "Offer",
          "price": "99",
          "priceCurrency": "INR",
          "priceValidUntil": "2025-12-31"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "643",
          "bestRating": "5"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        
        {/* Additional SEO meta tags */}
        <meta name="theme-color" content="#ec4899" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cufy" />
        
        {/* Favicon and icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//supabase.co" />
        <link rel="dns-prefetch" href="//google.com" />
      </head>
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
          <WebVitals />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}