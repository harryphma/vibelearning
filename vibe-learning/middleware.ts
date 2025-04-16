//TO CHECK LOGIN WITH GOOGLE, USE BELOW CODE 

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Array of public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/callback']

export async function middleware(request: NextRequest) {
  // Allow public routes and static assets
  if (publicRoutes.includes(request.nextUrl.pathname) || 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  try {
    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // We'll handle cookie setting in the actual redirect response
          },
          remove(name: string, options: CookieOptions) {
            // We'll handle cookie removal in the actual redirect response
          }
        }
      }
    )

    // Get the session
    const { data: { session } } = await supabase.auth.getSession()

    // If no session and trying to access protected route, redirect to login
    if (!session && !publicRoutes.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // If has session and trying to access auth pages, redirect to main page
    if (session && request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Allow the request to proceed normally
    return NextResponse.next()
  } catch (error) {
    console.error('Unexpected error in middleware:', error)
    // On error, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}


//TO DO NORMAL CODE, USE BELOW CODE
// import { createServerClient, type CookieOptions } from '@supabase/ssr'
// import { NextResponse, type NextRequest } from 'next/server'

// // Array of public routes that don't require authentication
// const publicRoutes = ['/auth/login', '/auth/callback', '/flashcards', '/']

// export async function middleware(request: NextRequest) {
//   // Allow all routes for development/testing
//   return NextResponse.next()
// }

// export const config = {
//   matcher: [
//     '/((?!_next/static|_next/image|favicon.ico|public).*)',
//   ],
// } 

