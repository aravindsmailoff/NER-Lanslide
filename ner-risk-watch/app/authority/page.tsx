import { redirect } from 'next/navigation'
import { hasAuthoritySession } from '@/lib/authority-session'
import { AuthorityCommandCenter } from '@/components/authority-command-center'

export default async function AuthorityPage() {
  if (!(await hasAuthoritySession())) redirect('/login?returnTo=%2Fauthority')
  return <AuthorityCommandCenter />
}
