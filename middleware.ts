import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Update session for all requests
  const { response, session } = await updateSession(request)

  // Forward the current pathname so the root layout can detect the route
  response.headers.set("x-next-pathname", pathname)

  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url)
    // # Reason: Preserve any auth cookie updates during redirect.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie)
    })
    return redirectResponse
  }
  
  // Check if we're accessing a protected route
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      // No session found, redirect to login
      return redirectWithCookies(new URL('/login', request.url))
    }
  }
  
  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (pathname === '/login' || pathname === '/signup') {
    if (session) {
      return redirectWithCookies(new URL('/', request.url))
    }
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
