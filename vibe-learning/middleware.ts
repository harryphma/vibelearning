import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicRoutes = ['/auth/login', '/auth/callback']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Allow public routes and static assets immediately
  if (publicRoutes.includes(request.nextUrl.pathname) || 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/favicon.ico')) {
    return response
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = request.cookies.get(name)
            if (cookie?.value) {
              console.log(`Found cookie in middleware: ${name}`)
            }
            return cookie?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              domain: request.nextUrl.hostname,
              path: '/',
              maxAge: 60, // 1 minute
              expires: new Date(Date.now() + 60 * 1000), // Also set explicit expiration
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              path: '/',
              expires: new Date(0)
            })
          }
        }
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    // Log the current state
    console.log('Middleware check:', {
      path: request.nextUrl.pathname,
      hasSession: !!session,
      cookies: request.cookies.getAll().map(c => c.name)
    })

    if (!session) {
      // No session, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Has session and trying to access auth pages
    if (session && request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}