import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { sanitizeNextPath } from '@/lib/auth/next-path'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicSubmitRoute = pathname === '/dashboard/submit-fine'
  
  // Update session for all requests
  const { response, session } = await updateSession(request)

  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url)
    // # Reason: Preserve any auth cookie updates during redirect.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie)
    })
    return redirectResponse
  }
  
  // Check if we're accessing a protected route
  if (pathname.startsWith('/dashboard') && !isPublicSubmitRoute) {
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      // # Reason: Preserve intent so auth can resume exactly where the user started.
      loginUrl.searchParams.set(
        'next',
        sanitizeNextPath(`${pathname}${request.nextUrl.search}`)
      )
      return redirectWithCookies(loginUrl)
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
