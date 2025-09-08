import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })

  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/boys-onboarding', '/girls-onboarding', '/gender-selection']
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If trying to access a protected route without a token, redirect to home
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If authenticated and trying to access gender selection, check if user exists
  if (pathname === '/gender-selection' && token) {
    // Allow access to gender selection page
    return NextResponse.next()
  }

  // If authenticated and trying to access onboarding, allow it
  if ((pathname === '/boys-onboarding' || pathname === '/girls-onboarding') && token) {
    return NextResponse.next()
  }

  // If authenticated and trying to access dashboard, allow it
  if (pathname === '/dashboard' && token) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/boys-onboarding/:path*', '/girls-onboarding/:path*', '/gender-selection/:path*']
}
