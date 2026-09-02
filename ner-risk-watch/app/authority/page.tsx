import { redirect } from 'next/navigation'
import { hasAuthoritySession } from '@/lib/authority-session'

export default async function AuthorityPage() {
  if (!(await hasAuthoritySession())) redirect('/login?returnTo=%2Fauthority')
  return <main className="min-h-screen bg-background p-8 text-foreground"><h1 className="text-3xl font-semibold">Authority portal</h1><p className="mt-2 text-muted-foreground">Protected operations access is active.</p></main>
}
