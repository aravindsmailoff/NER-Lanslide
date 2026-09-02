import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'ner-authority-session'
const SESSION_VALUE = 'authenticated-authority-demo'

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/authority') && request.cookies.get(SESSION_COOKIE)?.value !== SESSION_VALUE) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = { matcher: ['/authority/:path*'] }
