import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('authjs.session-token') ||
                req.cookies.get('__Secure-authjs.session-token')
  const isAuth = !!token
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                    req.nextUrl.pathname.startsWith('/forgot-password') ||
                    req.nextUrl.pathname.startsWith('/reset-password')

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  if (!isAuth && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/forgot-password', '/reset-password']
}