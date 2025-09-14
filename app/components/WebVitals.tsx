'use client'

import { useEffect } from 'react'

// Web Vitals tracking for SEO performance
export function WebVitals() {
  useEffect(() => {
    // Dynamic import of web-vitals for performance
    const trackWebVitals = async () => {
      try {
        const { onCLS, onFID, onFCP, onLCP, onTTFB } = await import('web-vitals')
        
        onCLS((metric) => {
          // Track Cumulative Layout Shift
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'CLS',
              value: Math.round(metric.value * 1000),
              custom_parameter_1: metric.rating,
            })
          }
        })

        onFID((metric) => {
          // Track First Input Delay
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'FID',
              value: Math.round(metric.value),
              custom_parameter_1: metric.rating,
            })
          }
        })

        onFCP((metric) => {
          // Track First Contentful Paint
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'FCP',
              value: Math.round(metric.value),
              custom_parameter_1: metric.rating,
            })
          }
        })

        onLCP((metric) => {
          // Track Largest Contentful Paint
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'LCP',
              value: Math.round(metric.value),
              custom_parameter_1: metric.rating,
            })
          }
        })

        onTTFB((metric) => {
          // Track Time to First Byte
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'TTFB',
              value: Math.round(metric.value),
              custom_parameter_1: metric.rating,
            })
          }
        })
      } catch (error) {
        console.error('Error loading web-vitals:', error)
      }
    }

    trackWebVitals()
  }, [])

  return null
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
