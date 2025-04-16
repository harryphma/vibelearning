import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('Full callback URL:', request.url)
  console.log('All URL parameters:', Object.fromEntries(requestUrl.searchParams))
  console.log('Code parameter:', code)

  // Create response object early to handle cookies
  const response = NextResponse.redirect(new URL('/', request.url))

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            path: '/',
            expires: new Date(0)
          })
        }
      }
    }
  )

  try {
    if (!code) {
      throw new Error('No code provided')
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Session exchange error:', error)
      throw error
    }

    if (!data.session) {
      throw new Error('No session data received')
    }

    console.log('Successfully authenticated, redirecting to flashcards...')
    return response
  } catch (error) {
    console.error('Auth error:', error)
    // Clear any existing auth cookies on error
    const cookiesToClear = request.cookies.getAll()
    cookiesToClear.forEach(cookie => {
      if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
        response.cookies.set({
          name: cookie.name,
          value: '',
          path: '/',
          expires: new Date(0)
        })
      }
    })
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
} 