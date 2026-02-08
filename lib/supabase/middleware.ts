import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const debugAuth = process.env.AUTH_DEBUG === 'true'
  const cookiesSet: string[] = []

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            if (value === '') {
              supabaseResponse.cookies.delete(name)
            } else {
              supabaseResponse.cookies.set(name, value, options)
            }
            cookiesSet.push(name)
          })
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  // Refresh session if expired
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Auth error in middleware:', error)
  }

  if (debugAuth) {
    // # Reason: Debug refresh flow without exposing sensitive token values.
    const cookieNames = request.cookies.getAll().map((cookie) => cookie.name)
    console.log('[auth-mw]', {
      path: request.nextUrl.pathname,
      hasSession: Boolean(session),
      cookieCount: cookieNames.length,
      cookieNames,
      cookiesSet,
    })
  }

  return { response: supabaseResponse, session }
}
