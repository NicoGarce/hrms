import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PREFIXES = ['/login', '/forgot-password', '/reset-password']

export function proxy(req: NextRequest) {
  const token = req.cookies.get('authjs.session-token') ||
                req.cookies.get('__Secure-authjs.session-token')
  const isAuth = !!token
  const isAuthPage = PUBLIC_PREFIXES.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix)
  )

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard',   req.url))
    }
    return NextResponse.next()
  }

  // Anything matched by `matcher` below that isn't a public auth page
  // requires a session. Add new protected route prefixes to `matcher`
  // only — this check itself no longer needs to change per-feature.
  if (!isAuth) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/employees/:path*',
    '/login',
    '/forgot-password',
    '/reset-password',
  ],
}