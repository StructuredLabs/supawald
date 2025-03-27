import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Skip auth for API routes, static files, and Supabase storage operations
  if (
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/static') ||
    req.nextUrl.pathname.includes('.') ||
    req.nextUrl.pathname.includes('storage/v1') ||  // Allow Supabase storage operations
    req.method === 'OPTIONS'  // Allow CORS preflight requests
  ) {
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization')

  // Get credentials from environment variables
  const username = process.env.AUTH_USERNAME
  const password = process.env.AUTH_PASSWORD

  if (!username || !password) {
    console.error('Missing authentication credentials in environment variables')
    return new NextResponse('Server configuration error', { status: 500 })
  }

  const expected = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64')

  if (auth !== expected) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Supawald Admin Area"' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon.ico).*)'],
} 