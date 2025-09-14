import { Metadata } from 'next'

interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  path: string
  image?: string
}

export function generateSEOMetadata(config: SEOConfig): Metadata {
  const baseUrl = 'https://cufy.online'
  const fullUrl = `${baseUrl}${config.path}`
  const ogImage = config.image || '/og-default.jpg'

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    openGraph: {
      title: config.title,
      description: config.description,
      url: fullUrl,
      siteName: 'Cufy - College Dating Platform',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [ogImage],
      creator: '@cufyapp',
      site: '@cufyapp',
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// Pre-defined SEO configs for common pages
export const SEO_CONFIGS = {
  home: {
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
    path: '/',
    image: '/og-home.jpg'
  },
  howItWorks: {
    title: 'How Cufy Works - Simple Steps to Find Your College Match',
    description: 'Learn how Cufy helps college students find meaningful relationships. Simple 4-step process: Create profile, get matched, chat, and meet. Start your love story today!',
    keywords: [
      'how cufy works',
      'college dating process',
      'student matching algorithm',
      'college relationship platform',
      'verified student profiles',
      'campus dating guide'
    ],
    path: '/how-it-works',
    image: '/og-how-it-works.jpg'
  },
  safety: {
    title: 'Safety First - Secure College Dating on Cufy',
    description: 'Your safety is our priority. Learn about Cufy\'s verification process, security features, and safety tips for college dating. Date with confidence.',
    keywords: [
      'college dating safety',
      'verified student profiles',
      'secure dating platform',
      'student safety features',
      'campus dating security'
    ],
    path: '/safety',
    image: '/og-safety.jpg'
  },
  successStories: {
    title: 'Success Stories - Real College Couples Found on Cufy',
    description: 'Read inspiring stories of college couples who found love on Cufy. Real testimonials from students who met their perfect match on our platform.',
    keywords: [
      'college dating success stories',
      'cufy testimonials',
      'student love stories',
      'college couples',
      'dating app reviews'
    ],
    path: '/success-stories',
    image: '/og-success-stories.jpg'
  },
  blog: {
    title: 'College Dating Tips & Relationship Advice - Cufy Blog',
    description: 'Expert advice on college dating, relationships, and campus life. Tips for students on finding love, maintaining relationships, and balancing studies.',
    keywords: [
      'college dating tips',
      'student relationship advice',
      'campus dating guide',
      'college romance tips',
      'student life advice'
    ],
    path: '/blog',
    image: '/og-blog.jpg'
  }
}

export function getPageSEO(page: keyof typeof SEO_CONFIGS): Metadata {
  return generateSEOMetadata(SEO_CONFIGS[page])
}
