import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://cufy.online'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/how-it-works',
          '/safety',
          '/success-stories',
          '/college-partners',
          '/student-discounts',
          '/help-center',
          '/contact-us',
          '/blog',
          '/privacy-policy',
          '/terms-of-service',
          '/gender-selection',
          '/subscription-selection',
          '/referral-program',
        ],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/boys-onboarding',
          '/girls-onboarding',
          '/complete-profile',
          '/payment',
          '/test-upload',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
