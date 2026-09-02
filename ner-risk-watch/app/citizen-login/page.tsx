'use client'

import { useState } from 'react'
import { Check, ChevronRight, Crosshair, FileCheck2, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react'

export default function CitizenLoginPage() {
  const [location, setLocation] = useState<'idle' | 'granted' | 'denied'>('idle')
  const [consented, setConsented] = useState(false)

  function requestLocation() {
    if (!navigator.geolocation) return setLocation('denied')
    navigator.geolocation.getCurrentPosition(() => setLocation('granted'), () => setLocation('denied'))
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-4 lg:px-8">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck /></div>
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary">NER RiskWatch</p><p className="text-xs text-muted-foreground">Citizen access</p></div>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary"><span className="size-2 rounded-full bg-primary" />Private citizen onboarding</p>
          <h1 className="max-w-xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">Stay informed where you live.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">Sign in with Google to personalize your safety map, receive location-relevant alerts, and find nearby shelters, food, medicine, hospitals, and safe routes.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><button disabled className="flex items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground opacity-60"><span className="rounded-full bg-card px-1.5 py-0.5 text-xs text-foreground">G</span>Google sign-in requires Firebase setup</button><a href="/" className="flex items-center justify-center rounded-xl border border-border px-5 py-3.5 text-sm font-semibold transition hover:bg-muted">Continue as guest</a></div>
          <p className="mt-3 text-xs text-muted-foreground">Google authentication is not active until the Firebase configuration is connected.</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="mb-7 flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole /></div><div><h2 className="font-semibold">Set up your safety profile</h2><p className="text-sm text-muted-foreground">You control what you share.</p></div></div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 rounded-2xl bg-muted/60 p-4"><FileCheck2 className="shrink-0 text-primary" /><div><p className="text-sm font-semibold">Minimal KYC</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Store your district, state, ID type, and last four ID digits only. Never share a full government ID number here.</p></div></div>
            <div className="flex gap-3 rounded-2xl bg-muted/60 p-4"><MapPin className="shrink-0 text-primary" /><div><p className="text-sm font-semibold">Google Maps-style location</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Allow browser location to center your map and show nearby emergency resources. You can skip this and choose a district manually.</p></div></div>
            <button onClick={requestLocation} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-left text-sm font-semibold transition hover:bg-muted"><span className="flex items-center gap-2"><Crosshair className="text-primary" />{location === 'granted' ? 'Location enabled' : location === 'denied' ? 'Location unavailable — choose manually' : 'Share my current location'}</span><ChevronRight /></button>
            <label className="flex gap-3 rounded-xl border border-border p-4 text-xs leading-5 text-muted-foreground"><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} className="mt-1 accent-[--primary]" /><span>I agree to use location for nearby safety results and to provide minimal profile details for relevant public alerts. I can withdraw consent later.</span></label>
            <button disabled={!consented} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"><Check />Save preferences</button>
          </div>
        </div>
      </section>
    </main>
  )
}
