import { NextResponse } from 'next/server'
import { AUTHORITY_SESSION_COOKIE } from '@/lib/authority-session'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(AUTHORITY_SESSION_COOKIE, '', { expires: new Date(0), path: '/', httpOnly: true, sameSite: 'lax' })
  return response
}
