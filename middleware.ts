import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create response
  const response = NextResponse.next()

  // Add headers to prevent caching issues
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // For HTML pages, prevent caching
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/', '/docs']
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Always allow public routes
  if (isPublicRoute) {
    return response
  }

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return response
  }

  // For dashboard routes, let client-side handle authentication
  // This is because we're using localStorage which is client-side only
  // The layout component will handle redirects
  if (pathname.startsWith('/dashboard')) {
    return response
  }

  // Allow all other routes
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

