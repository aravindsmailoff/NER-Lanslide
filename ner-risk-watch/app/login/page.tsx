'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import { isValidAuthorityCredential, DEMO_SESSION_VALUE, AUTHORITY_SESSION_COOKIE } from '@/lib/authority-credentials'

export default function LoginPage() {
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')
    if (isValidAuthorityCredential(email, password)) {
      document.cookie = `${AUTHORITY_SESSION_COOKIE}=${DEMO_SESSION_VALUE}; Path=/; SameSite=Lax; Secure`
      const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/authority'
      window.location.href = returnTo
    } else setError('Invalid authority credentials. Please enter your officer email and password.')
  }

  function handleDemoLogin() {
    document.cookie = `${AUTHORITY_SESSION_COOKIE}=${DEMO_SESSION_VALUE}; Path=/; SameSite=Lax; Secure`
    const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/authority'
    window.location.href = returnTo
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl lg:grid-cols-2"><section className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between"><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/15"><ShieldCheck /></div><div><p className="font-mono text-xs font-bold uppercase tracking-[0.2em]">NER RiskWatch</p><p className="text-sm text-primary-foreground/70">Authority operations</p></div></div><div><p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground/60">Secure operations console</p><h1 className="max-w-md text-4xl font-semibold leading-tight">Coordinate faster when every minute matters.</h1><p className="mt-5 max-w-md text-sm leading-6 text-primary-foreground/75">Monitor hazards, triage citizen reports, and keep essential resources visible across Northeast India.</p></div><p className="text-xs text-primary-foreground/60">For authorized disaster response personnel only.</p></section><section className="p-7 sm:p-10"><div className="mb-10 flex items-center gap-3 lg:hidden"><div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck /></div><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">NER RiskWatch</p><p className="text-xs text-muted-foreground">Authority operations</p></div></div><div className="mb-8"><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary">Authorized access</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Sign in to dashboard</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">This secure console is restricted to authorized disaster response personnel.</p></div><form className="flex flex-col gap-5" onSubmit={handleSubmit}><label className="flex flex-col gap-2 text-sm font-medium">Work email<input name="email" type="email" defaultValue="officer@ner-riskwatch.gov.in" placeholder="officer@ner-riskwatch.gov.in" className="rounded-xl border border-input bg-background px-4 py-3 outline-none ring-primary/20 transition placeholder:text-muted-foreground focus:ring-4" /></label><label className="flex flex-col gap-2 text-sm font-medium">Password<input name="password" type="password" defaultValue="demo-password" placeholder="Enter your password" className="rounded-xl border border-input bg-background px-4 py-3 outline-none ring-primary/20 transition placeholder:text-muted-foreground focus:ring-4" /></label>{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<button className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90" type="submit">Continue to dashboard <ArrowRight /></button><button type="button" onClick={handleDemoLogin} className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20">⚡ 1-Click Demo Officer Access</button></form><div className="mt-8 flex items-center gap-2 rounded-xl bg-muted/70 p-4 text-xs leading-5 text-muted-foreground"><LockKeyhole className="shrink-0 text-primary" />Demo mode: Prefilled credentials or 1-Click demo access enabled for review and evaluation.</div><a href="/" className="mt-6 block text-center text-sm font-semibold text-primary hover:underline">Return to citizen map</a></section></div></main>
}
