'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  CircleHelp,
  CloudRain,
  Crosshair,
  Droplets,
  House,
  Layers3,
  MapPin,
  Menu,
  ShieldCheck,
  Siren,
  TriangleAlert,
  X,
  Phone,
  Send,
  CheckCircle2,
  Lock,
  ExternalLink,
  LifeBuoy,
  FileText,
  Ambulance,
  Compass
} from 'lucide-react'
import { hazardZones, pointsOfInterest } from '@/lib/hazard-overlays'

const RiskMap = dynamic(() => import('@/components/risk-map').then((module) => module.RiskMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[520px] items-center justify-center rounded-2xl border border-border bg-muted text-sm text-muted-foreground">
      Loading live map…
    </div>
  ),
})

export function CitizenPortal() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState(hazardZones[2])

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEmergencyHelpModal, setShowEmergencyHelpModal] = useState(false)
  const [showSafetyGuidanceModal, setShowSafetyGuidanceModal] = useState(false)
  const [showSheltersModal, setShowSheltersModal] = useState(false)

  // Report incident form state
  const [reportingName, setReportingName] = useState('')
  const [reportingPhone, setReportingPhone] = useState('')
  const [reportingLandmark, setReportingLandmark] = useState('')
  const [reportingOrigin, setReportingOrigin] = useState('Guwahati, Assam')
  const [reportingUrgency, setReportingUrgency] = useState<'critical' | 'urgent' | 'stable'>('critical')
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(['Evacuation', 'Medical Help'])
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [elderly, setElderly] = useState(0)
  const [gpsLat, setGpsLat] = useState<number>(26.1445)
  const [gpsLng, setGpsLng] = useState<number>(91.7362)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState<any | null>(null)

  // Auto-locate for report
  function captureReportLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLat(Number(pos.coords.latitude.toFixed(4)))
          setGpsLng(Number(pos.coords.longitude.toFixed(4)))
        },
        () => {},
        { enableHighAccuracy: true }
      )
    }
  }

  // Toggle need selection
  function toggleNeed(need: string) {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    )
  }

  // Handle SOS incident report submission
  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reportingName || !reportingPhone || !reportingLandmark) return
    setIsSubmitting(true)

    const payload = {
      fullName: reportingName,
      contactNumber: reportingPhone,
      latitude: gpsLat,
      longitude: gpsLng,
      landmark: reportingLandmark,
      origin: reportingOrigin,
      needs: selectedNeeds,
      urgency: reportingUrgency,
      adults: Number(adults),
      children: Number(children),
      elderly: Number(elderly),
      sector: 'PUBLIC CITIZEN DISPATCH',
      notes: `Report submitted via Web Citizen Portal. Verified GPS: ${gpsLat}, ${gpsLng}.`
    }

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const created = await res.json()
        setReportSuccess(created)
        setReportingName('')
        setReportingPhone('')
        setReportingLandmark('')
      }
    } catch (err) {
      console.error('Report submission failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3.5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary">NER RiskWatch</p>
              <p className="text-xs text-muted-foreground">Citizen Safety & Early Warning</p>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a className="text-foreground" href="#map">
              Risk Map
            </a>
            <button
              onClick={() => setShowSafetyGuidanceModal(true)}
              className="transition hover:text-foreground"
            >
              Safety Guides
            </button>
            <button
              onClick={() => setShowSheltersModal(true)}
              className="transition hover:text-foreground"
            >
              Safe Shelters
            </button>
            <a
              href="/login"
              className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
            >
              <Lock className="size-3.5" />
              <span>Authority Portal</span>
            </a>
          </nav>

          <button
            className="rounded-lg p-2 text-muted-foreground md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/citizen-login"
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              Citizen Sign In
            </a>
            <button
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
              onClick={() => {
                setShowReportModal(true)
                setReportSuccess(null)
                captureReportLocation()
              }}
            >
              Report Incident
            </button>
            <button
              className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow-sm transition hover:bg-destructive/90 active:scale-95"
              onClick={() => setShowEmergencyHelpModal(true)}
            >
              <Siren className="size-4 animate-pulse" />
              <span>Emergency Help</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="border-t border-border p-5 md:hidden">
            <button className="float-right" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <X />
            </button>
            <div className="flex flex-col gap-4 pt-4 text-sm font-medium">
              <a href="#map" onClick={() => setMenuOpen(false)}>
                Risk Map
              </a>
              <button
                className="text-left"
                onClick={() => {
                  setMenuOpen(false)
                  setShowSafetyGuidanceModal(true)
                }}
              >
                Safety Guides
              </button>
              <button
                className="text-left"
                onClick={() => {
                  setMenuOpen(false)
                  setShowSheltersModal(true)
                }}
              >
                Safe Shelters
              </button>
              <a href="/login" className="font-semibold text-primary" onClick={() => setMenuOpen(false)}>
                Authority Portal Login →
              </a>
              <div className="mt-2 flex flex-col gap-2">
                <button
                  className="w-full rounded-xl border border-border py-2 text-center font-semibold"
                  onClick={() => {
                    setMenuOpen(false)
                    setShowReportModal(true)
                  }}
                >
                  Report Incident
                </button>
                <button
                  className="w-full rounded-xl bg-destructive py-2 text-center font-semibold text-white"
                  onClick={() => {
                    setMenuOpen(false)
                    setShowEmergencyHelpModal(true)
                  }}
                >
                  Emergency Help (Hotlines)
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Banner */}
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-7 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <span className="size-2 rounded-full bg-primary animate-ping" />
              Live Public Disaster Intelligence · Northeast India
            </div>
            <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              Know your risk. <span className="text-primary">Move with confidence.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Check current flood and landslide conditions across Northeast India, find nearby safe places, and make
              informed decisions before severe weather arrives.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Crosshair className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Location Services</p>
              <p className="text-xs text-muted-foreground">Tap map control to locate your coordinates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section id="map" className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Northeast India Live Hazard Map</h2>
              <p className="text-sm text-muted-foreground">Basemap with dynamic landslide and flood risk polygons</p>
            </div>
            <button
              onClick={() => setShowSheltersModal(true)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              <House className="size-4 text-primary" />
              <span>Verified Shelters</span>
            </button>
          </div>

          <div className="h-[62vh] min-h-[520px]">
            <RiskMap />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <i className="size-3 rounded-full bg-destructive" />
              Critical Hazard
            </span>
            <span className="flex items-center gap-2">
              <i className="size-3 rounded-full bg-orange-500" />
              High Risk
            </span>
            <span className="flex items-center gap-2">
              <i className="size-3 rounded-full bg-yellow-500" />
              Moderate Risk
            </span>
            <span className="flex items-center gap-2">
              <i className="size-3 rounded-full bg-primary" />
              Safe Shelter
            </span>
            <span className="ml-auto">Map data © OpenStreetMap contributors</span>
          </div>
        </div>

        {/* Sidebar Cards */}
        <aside className="flex flex-col gap-4">
          {/* Selected Zone Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Monitored Sector
                </p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{selectedZone.name.split(' - ')[0]}</h3>
              </div>
              <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold capitalize text-destructive">
                {selectedZone.risk}
              </span>
            </div>
            <div className="flex items-center gap-3 border-y border-border py-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <TriangleAlert className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold capitalize text-foreground">{selectedZone.type} Watch Active</p>
                <p className="text-xs text-muted-foreground">Slope saturation index high</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {selectedZone.description}. Stay alert, avoid crossing flowing water, and check local advisories before
              mountain travel.
            </p>
            <button
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 shadow-sm"
              onClick={() => setShowSafetyGuidanceModal(true)}
            >
              <span>View Safety Guidance</span>
              <ChevronDown className="size-4" />
            </button>
          </div>

          {/* Current Conditions Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CloudRain className="text-primary size-5" />
              <h3 className="font-semibold text-foreground">Meteorological Telemetry</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/60 p-3">
                <Droplets className="mb-2 text-primary size-4" />
                <p className="text-2xl font-bold text-foreground">78%</p>
                <p className="text-xs text-muted-foreground">Precipitation Chance</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <Siren className="mb-2 text-destructive size-4" />
                <p className="text-2xl font-bold text-destructive">12</p>
                <p className="text-xs text-muted-foreground">Active Advisories</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Updated live · Source: Regional Doppler Radar & IMD</p>
          </div>

          {/* Safe Place Card */}
          <div id="help" className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm">
            <div className="flex items-start gap-3">
              <House className="size-6 shrink-0" />
              <div>
                <h3 className="font-semibold text-base">Find a Verified Shelter</h3>
                <p className="mt-1 text-xs leading-relaxed text-primary-foreground/85">
                  See nearby community halls, sports complexes, and disaster relief shelters equipped with rations and
                  medical kits.
                </p>
              </div>
            </div>
            <button
              className="mt-4 flex items-center gap-2 text-xs font-bold underline underline-offset-4"
              onClick={() => setShowSheltersModal(true)}
            >
              <span>Open Shelters Directory</span>
              <MapPin className="size-3.5" />
            </button>
          </div>
        </aside>
      </section>

      {/* Report Incident Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Report Emergency Incident</h3>
                  <p className="text-xs text-muted-foreground">Transmits directly to NDRF and district dispatchers</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="size-8" />
                </div>
                <h4 className="mt-4 text-xl font-bold text-foreground">Emergency Report Ingested</h4>
                <p className="mt-1 font-mono text-sm font-semibold text-primary">{reportSuccess.referenceId}</p>
                <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
                  Your distress report has been queued and transmitted to active response units. Responders in your sector
                  have been alerted with your coordinates.
                </p>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-foreground">
                    Your Full Name *
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra Das"
                      value={reportingName}
                      onChange={(e) => setReportingName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-primary/20 focus:ring-2"
                    />
                  </label>

                  <label className="text-xs font-semibold text-foreground">
                    Contact Phone Number *
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765-43210"
                      value={reportingPhone}
                      onChange={(e) => setReportingPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-primary/20 focus:ring-2"
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-foreground">
                    State / Region
                    <select
                      value={reportingOrigin}
                      onChange={(e) => setReportingOrigin(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none"
                    >
                      <option value="Guwahati, Assam">Guwahati / Kamrup Metro, Assam</option>
                      <option value="Sonapur / Ri-Bhoi Corridor">Sonapur / Ri-Bhoi Corridor (NH-6)</option>
                      <option value="East Khasi Hills, Meghalaya">East Khasi Hills / Sohra, Meghalaya</option>
                      <option value="Aizawl, Mizoram">Aizawl, Mizoram</option>
                      <option value="Imphal, Manipur">Imphal, Manipur</option>
                      <option value="Gangtok, Sikkim">Gangtok, Sikkim</option>
                      <option value="Itanagar, Arunachal Pradesh">Itanagar, Arunachal Pradesh</option>
                    </select>
                  </label>

                  <label className="text-xs font-semibold text-foreground">
                    Urgency Level
                    <select
                      value={reportingUrgency}
                      onChange={(e) => setReportingUrgency(e.target.value as any)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none font-semibold"
                    >
                      <option value="critical">CRITICAL (Threat to Life / Trapped)</option>
                      <option value="urgent">URGENT (Evacuation Required)</option>
                      <option value="stable">STABLE (Needs Assistance)</option>
                    </select>
                  </label>
                </div>

                <label className="block text-xs font-semibold text-foreground">
                  Exact Landmark & Street Description *
                  <input
                    type="text"
                    required
                    placeholder="Near Sonapur Bridge approach, Km 24 on NH-6"
                    value={reportingLandmark}
                    onChange={(e) => setReportingLandmark(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-primary/20 focus:ring-2"
                  />
                </label>

                <div>
                  <span className="block text-xs font-semibold text-foreground">Immediate Assistance Needs</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {['Evacuation', 'Medical Help', 'Clean Water', 'Food Rations', 'Rescue Boat', 'Elderly Assistance'].map(
                      (need) => (
                        <button
                          key={need}
                          type="button"
                          onClick={() => toggleNeed(need)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            selectedNeeds.includes(need)
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          {need}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-muted/30 p-3">
                  <label className="text-xs font-medium text-foreground">
                    Adults
                    <input
                      type="number"
                      min={0}
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1 text-center text-sm font-semibold"
                    />
                  </label>
                  <label className="text-xs font-medium text-foreground">
                    Children
                    <input
                      type="number"
                      min={0}
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1 text-center text-sm font-semibold"
                    />
                  </label>
                  <label className="text-xs font-medium text-foreground">
                    Elderly
                    <input
                      type="number"
                      min={0}
                      value={elderly}
                      onChange={(e) => setElderly(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1 text-center text-sm font-semibold"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={captureReportLocation}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Crosshair className="size-3.5" />
                    <span>Auto-Detect GPS Coordinates</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 rounded-xl bg-destructive px-5 py-2 text-xs font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-50"
                    >
                      <Send className="size-3.5" />
                      <span>{isSubmitting ? 'Transmitting...' : 'Transmit Emergency Report'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Emergency Help Hotlines Modal */}
      {showEmergencyHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-destructive text-white">
                  <Phone className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Emergency Response Hotlines</h3>
                  <p className="text-xs text-muted-foreground">Toll-free emergency dispatch lines for Northeast India</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyHelpModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {[
                { title: 'National Emergency Helpline', number: '112', desc: 'All-in-one Police, Fire & Medical' },
                { title: 'NDRF Control Room (National HQ)', number: '1078', desc: 'Specialized search & rescue' },
                { title: 'Assam State Disaster Management (ASDMA)', number: '1070', desc: 'Floods & landslides ops' },
                { title: 'Emergency Medical Ambulance', number: '108', desc: 'Critical trauma & casualty transport' },
                { title: 'Meghalaya State Disaster Helpline', number: '1077', desc: 'Shillong & Sohra emergency desk' },
                { title: 'Mizoram Disaster Control Room', number: '0389-2334892', desc: 'Aizawl slope stability response' }
              ].map((line) => (
                <div
                  key={line.title}
                  className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-3.5"
                >
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{line.title}</h4>
                    <p className="text-[11px] text-muted-foreground">{line.desc}</p>
                  </div>
                  <a
                    href={`tel:${line.number.replace(/[^0-9]/g, '')}`}
                    className="flex items-center gap-1.5 rounded-xl bg-destructive px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
                  >
                    <Phone className="size-3.5" />
                    <span>{line.number}</span>
                  </a>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowEmergencyHelpModal(false)}
              className="mt-5 w-full rounded-xl border border-border py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Safety & Preparedness Guidance Modal */}
      {showSafetyGuidanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Disaster Survival & Preparedness Guide</h3>
                  <p className="text-xs text-muted-foreground">Standard operating procedures for Northeast terrain</p>
                </div>
              </div>
              <button
                onClick={() => setShowSafetyGuidanceModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-foreground">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-destructive">
                  <TriangleAlert className="size-4" />
                  Landslide Warning Signs in Hill Corridors
                </h4>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
                  <li>Springs, seeps, or saturated ground appearing in areas not typically wet.</li>
                  <li>New cracks developing in plaster, tile, brick, or building foundations.</li>
                  <li>Leaning trees, utility poles, or retaining walls along slopes.</li>
                  <li>A sudden increase or decrease in creek/river flow accompanied by water turning muddy.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-primary">
                  <CloudRain className="size-4" />
                  Flood Surge & Brahmaputra Basin Protocol
                </h4>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
                  <li>Immediately switch off main electricity circuit breakers and LPG gas cylinders.</li>
                  <li>Never attempt to walk or drive through flowing water—15 cm of water can knock you down.</li>
                  <li>Move livestock and family members to upper floors or designated embankment shelters.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <LifeBuoy className="size-4 text-amber-500" />
                  72-Hour Survival Kit Essentials
                </h4>
                <p className="mt-1 text-muted-foreground">
                  Pack a waterproof backpack with: chlorine water purification tablets, dry packaged rations, LED
                  flashlight with extra batteries, whistle for rescue team location, prescription medicines, and photo ID
                  copies.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSafetyGuidanceModal(false)}
              className="mt-5 w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:brightness-110"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Verified Shelters Modal */}
      {showSheltersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <House className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Verified Northeast Relief Shelters</h3>
                  <p className="text-xs text-muted-foreground">State government designated emergency evacuation hubs</p>
                </div>
              </div>
              <button
                onClick={() => setShowSheltersModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {pointsOfInterest
                .filter((p) => p.type === 'shelter' || p.type === 'hospital')
                .map((poi) => (
                  <div
                    key={poi.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            poi.type === 'hospital' ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary'
                          }`}
                        >
                          {poi.type}
                        </span>
                        <h4 className="text-sm font-bold text-foreground">{poi.name}</h4>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{poi.description || 'Verified Shelter Facility'}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        GPS Anchor: {poi.lat.toFixed(4)}° N, {poi.lng.toFixed(4)}° E
                      </p>
                    </div>

                    <a
                      href={`https://maps.google.com/?q=${poi.lat},${poi.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      <span>Directions</span>
                      <ExternalLink className="size-3 text-muted-foreground" />
                    </a>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setShowSheltersModal(false)}
              className="mt-5 w-full rounded-xl border border-border py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer Notice */}
      <section id="prepare" className="border-t border-border bg-muted/30">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-5 text-xs text-muted-foreground lg:px-8">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-primary shrink-0" />
            <p>
              <strong className="text-foreground">In immediate life-threatening danger, dial 112 or 1078.</strong> This
              dashboard synchronizes with NDRF 1st Bn (Patgaon) & State Disaster Management Authorities.
            </p>
          </div>
          <a href="/login" className="font-semibold text-primary hover:underline">
            Authority Operations Console →
          </a>
        </div>
      </section>
    </main>
  )
}
