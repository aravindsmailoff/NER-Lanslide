import { cookies } from 'next/headers'
import { AUTHORITY_SESSION_COOKIE, DEMO_SESSION_VALUE } from '@/lib/authority-credentials'

export async function hasAuthoritySession() {
  const cookieStore = await cookies()
  return cookieStore.get(AUTHORITY_SESSION_COOKIE)?.value === DEMO_SESSION_VALUE
}

export { AUTHORITY_SESSION_COOKIE, DEMO_SESSION_VALUE }
