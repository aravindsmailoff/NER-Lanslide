export const AUTHORITY_SESSION_COOKIE = 'ner-authority-session'
export const DEMO_SESSION_VALUE = 'authenticated-authority-demo'

export function isValidAuthorityCredential(email: string, password: string) {
  return email.trim().toLowerCase() === 'officer@example.gov' && password === 'demo-password'
}

export function authoritySessionCookie(value = DEMO_SESSION_VALUE) {
  return `${AUTHORITY_SESSION_COOKIE}=${value}; Path=/; SameSite=Lax; Secure`
}

export function clearedAuthoritySessionCookie() {
  return `${AUTHORITY_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure`
}
