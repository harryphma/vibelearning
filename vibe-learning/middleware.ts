//TO CHECK LOGIN WITH GOOGLE, USE BELOW CODE 

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Array of public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/callback', '/']

export async function middleware(request: NextRequest) {
    // Allow public routes and static assets
    if (publicRoutes.includes(request.nextUrl.pathname) || 
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/favicon.ico')) {
            return NextResponse.next()
    }

    // Create a response to modify its headers
    // const response = NextResponse.next({
    //     request: {
    //     headers: request.headers,
    //     },
    // })

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
                        // response.cookies.set({
                        // name,
                        // value,
                        // ...options,
                        // path: '/',
                        // sameSite: 'lax',
                        // secure: process.env.NODE_ENV === 'production',
                        // httpOnly: true
                        // })
                    },
                    remove(name: string, options: CookieOptions) {
                        // response.cookies.set({
                        // name,
                        // value: '',
                        // ...options,
                        // path: '/',
                        // expires: new Date(0)
                        // })
                    }
                }
            }
        )

    // Get the session
        const { data: { session } } = await supabase.auth.getSession()

        // If no session and trying to access protected route, redirect to login
        if (!session && !publicRoutes.includes(request.nextUrl.pathname)) {
            const redirectUrl = new URL('/auth/login', request.url)
            return NextResponse.redirect(redirectUrl)
        }

        // If has session and trying to access auth pages, redirect to flashcards
        if (session && request.nextUrl.pathname.startsWith('/auth')) {
            const redirectUrl = new URL('/', request.url)
            return NextResponse.redirect(redirectUrl)
        }

        // If accessing root path with session, redirect to flashcards
        // if (session && request.nextUrl.pathname === '/') {
        //   const redirectUrl = new URL('/flashcards', request.url)
        //   return NextResponse.redirect(redirectUrl)
        // }

        return NextResponse.next()
    } catch (error) {
        console.error('Unexpected error in middleware:', error)
        // On error, allow the request to continue
        return NextResponse.next()
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

