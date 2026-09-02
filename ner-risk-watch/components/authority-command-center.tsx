'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  ShieldAlert,
  Radio,
  Users,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Bell,
  Send,
  Sparkles,
  RefreshCw,
  LogOut,
  MapPin,
  Clock,
  Phone,
  Layers,
  ChevronRight,
  ExternalLink,
  Flame,
  Droplets,
  Mountain,
  Volume2
} from 'lucide-react'
import { hazardZones } from '@/lib/hazard-overlays'

// Dynamically import map to prevent SSR issues
const AuthorityMap = dynamic(() => import('@/components/authority-map').then((mod) => mod.AuthorityMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[480px] items-center justify-center rounded-2xl border border-border bg-muted/30 text-sm text-muted-foreground">
      <Radio className="mr-2 size-5 animate-spin text-primary" /> Loading Tactical GIS Radar...
    </div>
  ),
})

interface Incident {
  id: string
  referenceId: string
  fullName: string
  contactNumber: string
  latitude: number
  longitude: number
  landmark: string
  origin: string
  needs: string[]
  urgency: 'critical' | 'urgent' | 'stable'
  adults: number
  children: number
  elderly: number
  timestamp: number
  status: 'PENDING_OFFLINE' | 'DISPATCHED' | 'EN_ROUTE' | 'RESOLVED'
  assignedUnit?: string
  notes?: string
  sector?: string
}

interface Advisory {
  id: string
  title: string
  sector: string
  type: string
  level: 'critical' | 'high' | 'medium' | 'low'
  time: string
  description: string
  tags: string[]
}

export function AuthorityCommandCenter() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [advisories, setAdvisories] = useState<Advisory[]>([])
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'DISPATCHED' | 'RESOLVED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastSector, setBroadcastSector] = useState('SECTOR 2 - BRAHMAPUTRA BASIN')
  const [broadcastType, setBroadcastType] = useState('Flood Surge Warning')
  const [broadcastLevel, setBroadcastLevel] = useState<'critical' | 'high' | 'medium' | 'low'>('high')
  const [broadcastDesc, setBroadcastDesc] = useState('')
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // Synthetic Sonar Chime for Emergency Alerts
  function playSonarChime() {
    if (!audioEnabled || typeof window === 'undefined') return
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Initial fetch and Realtime SSE Stream
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [incRes, advRes] = await Promise.all([
          fetch('/api/incidents'),
          fetch('/api/advisories')
        ])
        if (incRes.ok) {
          const incData = await incRes.json()
          setIncidents(incData)
          if (incData.length > 0) setSelectedIncident(incData[0])
        }
        if (advRes.ok) {
          const advData = await advRes.json()
          setAdvisories(advData)
        }
      } catch (err) {
        console.error('Failed to load initial data:', err)
      }
    }
    fetchInitialData()

    // Connect to Server-Sent Events stream for instant updates
    let eventSource: EventSource | null = null
    try {
      eventSource = new EventSource('/api/stream')
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'INCIDENT_NEW') {
            setIncidents((prev) => [data.incident, ...prev.filter((i) => i.id !== data.incident.id)])
            playSonarChime()
            setStatusMessage(`⚡ Live Incident Ingested: ${data.incident.referenceId}`)
            setTimeout(() => setStatusMessage(null), 5000)
          } else if (data.type === 'INCIDENT_UPDATED') {
            setIncidents((prev) =>
              prev.map((i) => (i.id === data.incident.id ? data.incident : i))
            )
          }
        } catch {
          // ignore stream parse errors
        }
      }
    } catch (e) {
      console.warn('SSE stream not available:', e)
    }

    return () => {
      if (eventSource) eventSource.close()
    }
  }, [audioEnabled])

  // Incident status update
  async function updateStatus(id: string, newStatus: 'DISPATCHED' | 'EN_ROUTE' | 'RESOLVED', assignedUnit?: string) {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedUnit: assignedUnit || (newStatus === 'DISPATCHED' ? 'NDRF 1st Bn (Patgaon Quick Response)' : undefined)
        })
      })
      if (res.ok) {
        const updated = await res.json()
        setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)))
        if (selectedIncident?.id === id) setSelectedIncident(updated)
        playSonarChime()
      }
    } catch (err) {
      console.error('Failed to update incident:', err)
    }
  }

  // Trigger Judge Demo Landslide SOS
  async function triggerJudgeDemoSOS() {
    const demoPayload = {
      fullName: 'Assam State Transport Bus (Stranded Passengers)',
      contactNumber: '+91 94350-99881',
      latitude: 26.0425,
      longitude: 91.9822,
      landmark: 'Sonapur Tunnel Approach, NH-6 / Meghalaya Border',
      origin: 'Kamrup Metro / Ri-Bhoi Corridor',
      needs: ['Evacuation', 'Heavy Machinery', 'Medical Help'],
      urgency: 'critical',
      adults: 32,
      children: 4,
      elderly: 3,
      sector: 'SECTOR 3 - SONAPUR CHOKEPOINT',
      notes: 'Active rockfall triggered by 72mm torrential downpour. Highway blocked in both directions.'
    }

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoPayload)
      })
      if (res.ok) {
        const created = await res.json()
        setIncidents((prev) => [created, ...prev])
        setSelectedIncident(created)
        playSonarChime()
        setStatusMessage('⚡ Judge Demo Landslide SOS Triggered & Ingested into Live Stream!')
        setTimeout(() => setStatusMessage(null), 6000)
      }
    } catch (e) {
      console.error('Demo trigger failed:', e)
    }
  }

  // Broadcast Advisory
  async function handleBroadcastSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!broadcastTitle || !broadcastDesc) return

    try {
      const res = await fetch('/api/advisories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle,
          sector: broadcastSector,
          type: broadcastType,
          level: broadcastLevel,
          description: broadcastDesc,
          tags: ['Command Broadcast', broadcastSector.split(' - ')[0]]
        })
      })
      if (res.ok) {
        const created = await res.json()
        setAdvisories((prev) => [created, ...prev])
        setBroadcastTitle('')
        setBroadcastDesc('')
        setIsBroadcasting(false)
        setStatusMessage(`📢 Regional Advisory Broadcasted to Public: ${created.title}`)
        setTimeout(() => setStatusMessage(null), 6000)
      }
    } catch (e) {
      console.error('Failed to broadcast advisory:', e)
    }
  }

  // Handle Logout
  async function handleSignout() {
    try {
      await fetch('/api/authority/signout', { method: 'POST' })
    } catch {
      // fallback
    }
    document.cookie = 'ner-authority-session=; Path=/; Max-Age=0'
    window.location.href = '/'
  }

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        inc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.landmark.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.referenceId.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (activeFilter === 'CRITICAL') return inc.urgency === 'critical'
      if (activeFilter === 'DISPATCHED') return inc.status === 'DISPATCHED' || inc.status === 'EN_ROUTE'
      if (activeFilter === 'RESOLVED') return inc.status === 'RESOLVED'
      return true
    })
  }, [incidents, searchQuery, activeFilter])

  // Analytics Metrics
  const activeCount = incidents.filter((i) => i.status !== 'RESOLVED').length
  const criticalCount = incidents.filter((i) => i.urgency === 'critical' && i.status !== 'RESOLVED').length
  const dispatchedCount = incidents.filter((i) => i.status === 'DISPATCHED' || i.status === 'EN_ROUTE').length
  const totalAssisted = incidents
    .filter((i) => i.status === 'RESOLVED' || i.status === 'DISPATCHED')
    .reduce((sum, i) => sum + (i.adults || 0) + (i.children || 0) + (i.elderly || 0), 0)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-md shadow-destructive/20">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-destructive">
                  NER MISSION CONTROL
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  RADAR ACTIVE
                </span>
              </div>
              <h1 className="text-sm font-semibold tracking-tight text-foreground lg:text-base">
                Northeast India Disaster Operations & Tactical Triage
              </h1>
            </div>
          </div>

          {/* Quick Actions & Judge Presentation Kit */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={triggerJudgeDemoSOS}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-red-500/20 transition hover:brightness-110 active:scale-95"
              title="Inject a realistic Landslide SOS at Sonapur Chokepoint to demonstrate multi-screen live response"
            >
              <Sparkles className="size-3.5" />
              <span>JUDGE DEMO KIT (TRIGGER SOS)</span>
            </button>

            <button
              onClick={() => setIsBroadcasting(!isBroadcasting)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              <Send className="size-3.5 text-primary" />
              <span>Broadcast Advisory</span>
            </button>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold transition ${
                audioEnabled ? 'bg-primary/10 text-primary border-primary/30' : 'bg-card text-muted-foreground'
              }`}
              title="Toggle synthetic sonar alert audio"
            >
              <Volume2 className="size-3.5" />
              <span>{audioEnabled ? 'Sonar ON' : 'Sonar Muted'}</span>
            </button>

            <a
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground hover:bg-muted"
            >
              <ExternalLink className="size-3.5" />
              <span>Citizen View</span>
            </a>

            <button
              onClick={handleSignout}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive hover:text-white"
            >
              <LogOut className="size-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Live Notification Bar if message present */}
        {statusMessage && (
          <div className="bg-destructive/10 px-4 py-1.5 text-center text-xs font-semibold text-destructive transition-all">
            {statusMessage}
          </div>
        )}
      </header>

      {/* KPI Stats Bar */}
      <section className="border-b border-border bg-muted/20 px-4 py-3 lg:px-8">
        <div className="mx-auto grid max-w-[1700px] grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-5">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Active Emergencies</span>
              <Siren className="size-4 text-destructive" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">{activeCount}</span>
              <span className="text-xs text-muted-foreground">in field queue</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Critical Threat</span>
              <AlertTriangle className="size-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-destructive lg:text-3xl">{criticalCount}</span>
              <span className="text-xs text-muted-foreground">life-safety SOS</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Units Deployed</span>
              <Radio className="size-4 text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-primary lg:text-3xl">{dispatchedCount}</span>
              <span className="text-xs text-muted-foreground">NDRF / SDRF teams</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">Citizens Assisted</span>
              <Users className="size-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">{totalAssisted}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">triage reached</span>
            </div>
          </div>
        </div>
      </section>

      {/* Broadcast Advisory Drawer / Modal */}
      {isBroadcasting && (
        <section className="border-b border-border bg-card p-5 shadow-lg lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="size-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Broadcast Regional Early Warning Advisory</h3>
              </div>
              <button
                onClick={() => setIsBroadcasting(false)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleBroadcastSubmit} className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Advisory Title (e.g., Soil Saturation Breach Alert)"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                required
                className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/20 focus:ring-2 sm:col-span-2"
              />
              <select
                value={broadcastSector}
                onChange={(e) => setBroadcastSector(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none"
              >
                <option value="SECTOR 2 - BRAHMAPUTRA BASIN">Sector 2 - Brahmaputra Basin (Assam)</option>
                <option value="SECTOR 3 - SONAPUR CHOKEPOINT">Sector 3 - Sonapur Chokepoint (NH-6)</option>
                <option value="SECTOR 4 - SOHRA ESCARPMENT">Sector 4 - Sohra / Cherrapunji (Meghalaya)</option>
                <option value="SECTOR 5 - AIZAWL RIDGE">Sector 5 - Aizawl Ridge (Mizoram)</option>
                <option value="GLOBAL">Global NER Regional Broadcast</option>
              </select>
              <select
                value={broadcastLevel}
                onChange={(e) => setBroadcastLevel(e.target.value as any)}
                className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none"
              >
                <option value="critical">Severity: CRITICAL</option>
                <option value="high">Severity: HIGH</option>
                <option value="medium">Severity: MODERATE</option>
                <option value="low">Severity: INFORMATIONAL</option>
              </select>
              <textarea
                rows={2}
                placeholder="Actionable advisory guidance for public safety and local authorities..."
                value={broadcastDesc}
                onChange={(e) => setBroadcastDesc(e.target.value)}
                required
                className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/20 focus:ring-2 sm:col-span-2"
              />
              <div className="flex justify-end gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcasting(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
                >
                  <Send className="size-4" />
                  <span>Transmit to Live Public Feed</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Main Operations Body */}
      <main className="mx-auto grid w-full max-w-[1700px] flex-1 gap-6 p-4 lg:grid-cols-[1fr_420px] lg:p-8">
        {/* Left Area: Tactical Radar Map + Incident Feed */}
        <div className="flex flex-col gap-6">
          {/* Tactical GIS Radar Map */}
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <Layers className="size-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Geospatial Mission Radar (Northeast India)
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-destructive" /> Critical Incident
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-500" /> Urgent
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500" /> Resolved
                </span>
              </div>
            </div>

            <div className="h-[460px] w-full">
              <AuthorityMap
                incidents={incidents}
                selectedIncident={selectedIncident}
                onSelectIncident={setSelectedIncident}
              />
            </div>
          </section>

          {/* Real-time Triage Board */}
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">Live Incident Triage Queue</h2>
                <p className="text-xs text-muted-foreground">
                  Multi-hazard field reports synchronized in real time via edge queue and SSE bus
                </p>
              </div>

              {/* Triage Search & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter by name, landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                />

                <div className="flex rounded-xl border border-border bg-muted/40 p-0.5 text-xs font-semibold">
                  {(['ALL', 'CRITICAL', 'DISPATCHED', 'RESOLVED'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-lg px-2.5 py-1 transition ${
                        activeFilter === filter
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Incidents List */}
            <div className="flex flex-col gap-3">
              {filteredIncidents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                  No incident reports matching filter criteria.
                </div>
              ) : (
                filteredIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all hover:border-primary/50 ${
                      selectedIncident?.id === incident.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                        : 'border-border bg-card/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                              incident.urgency === 'critical'
                                ? 'bg-destructive/15 text-destructive'
                                : incident.urgency === 'urgent'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {incident.urgency}
                          </span>
                          <span className="font-mono text-xs font-semibold text-muted-foreground">
                            {incident.referenceId}
                          </span>
                          <span className="text-xs text-muted-foreground">· {incident.sector || 'Northeast Corridor'}</span>
                        </div>
                        <h3 className="mt-1.5 text-base font-bold text-foreground">{incident.fullName}</h3>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3 text-primary" />
                          {incident.landmark} ({incident.origin})
                        </p>
                      </div>

                      {/* Status Badges */}
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                            incident.status === 'RESOLVED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : incident.status === 'DISPATCHED'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : incident.status === 'EN_ROUTE'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {incident.status === 'RESOLVED' && <CheckCircle2 className="size-3.5" />}
                          {incident.status}
                        </span>
                      </div>
                    </div>

                    {/* Needs and Counts */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {incident.needs.map((need) => (
                        <span
                          key={need}
                          className="rounded-lg border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground"
                        >
                          {need}
                        </span>
                      ))}

                      <span className="ml-auto font-mono text-xs text-muted-foreground">
                        👨‍👩‍👧‍👦 {incident.adults} Adults · {incident.children} Kids · {incident.elderly} Elderly
                      </span>
                    </div>

                    {/* Assigned Unit & Action Controls */}
                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                      <div className="text-xs text-muted-foreground">
                        {incident.assignedUnit ? (
                          <span className="font-medium text-primary">Unit: {incident.assignedUnit}</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">Awaiting Unit Assignment</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {incident.status !== 'DISPATCHED' && incident.status !== 'RESOLVED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateStatus(incident.id, 'DISPATCHED', 'NDRF 1st Bn (Patgaon Quick Response)')
                            }}
                            className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
                          >
                            Dispatch NDRF
                          </button>
                        )}

                        {incident.status === 'DISPATCHED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateStatus(incident.id, 'EN_ROUTE')
                            }}
                            className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white transition hover:brightness-110"
                          >
                            Mark En Route
                          </button>
                        )}

                        {incident.status !== 'RESOLVED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateStatus(incident.id, 'RESOLVED')
                            }}
                            className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          >
                            Resolve SOS
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar: Selected Detail Card & Regional Advisories */}
        <aside className="flex flex-col gap-6">
          {/* Detailed Selected Incident Card */}
          {selectedIncident ? (
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Selected Operations Target
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-foreground">{selectedIncident.fullName}</h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                    selectedIncident.urgency === 'critical'
                      ? 'bg-destructive/15 text-destructive'
                      : 'bg-amber-500/15 text-amber-600'
                  }`}
                >
                  {selectedIncident.urgency}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-primary" />
                  <span className="font-semibold text-foreground">{selectedIncident.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-3.5 text-primary" />
                  <span>
                    GPS: {selectedIncident.latitude.toFixed(4)}° N, {selectedIncident.longitude.toFixed(4)}° E
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-primary" />
                  <span>Reported: {new Date(selectedIncident.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {selectedIncident.notes && (
                <div className="mt-4 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed text-foreground">
                  <p className="font-semibold text-muted-foreground">Field / Dispatch Notes:</p>
                  <p className="mt-1">{selectedIncident.notes}</p>
                </div>
              )}

              {/* Direct Triage Quick Actions */}
              <div className="mt-5 flex flex-col gap-2">
                {selectedIncident.status !== 'DISPATCHED' && selectedIncident.status !== 'RESOLVED' && (
                  <button
                    onClick={() =>
                      updateStatus(selectedIncident.id, 'DISPATCHED', 'NDRF 1st Bn (Patgaon Quick Response)')
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:brightness-110"
                  >
                    <Radio className="size-4" /> Dispatch NDRF Unit
                  </button>
                )}

                {selectedIncident.status !== 'RESOLVED' && (
                  <button
                    onClick={() => updateStatus(selectedIncident.id, 'RESOLVED')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-xs font-bold text-emerald-600 hover:bg-muted"
                  >
                    <CheckCircle2 className="size-4" /> Mark Mission Resolved
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              Select an incident from the queue or map to inspect details and assign responders.
            </div>
          )}

          {/* Regional Saturation & Hazard Risk Feed */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mountain className="size-4 text-primary" />
                <h3 className="font-bold text-foreground">Northeast Vulnerability Radar</h3>
              </div>
              <span className="font-mono text-[10px] font-semibold text-muted-foreground">MONSOON T+24H</span>
            </div>

            <div className="space-y-3">
              {advisories.slice(0, 4).map((adv) => (
                <div key={adv.id} className="rounded-2xl border border-border bg-muted/30 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase text-primary">{adv.sector}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        adv.level === 'critical'
                          ? 'bg-destructive/15 text-destructive'
                          : adv.level === 'high'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {adv.level}
                    </span>
                  </div>
                  <h4 className="mt-1 text-xs font-bold text-foreground">{adv.title}</h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{adv.description}</p>
                  <div className="mt-2 text-[10px] text-muted-foreground">{adv.time}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
