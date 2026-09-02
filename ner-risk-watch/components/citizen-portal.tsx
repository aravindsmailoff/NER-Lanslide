'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Building2,
  Calendar,
  Camera,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock,
  CloudRain,
  Crosshair,
  Droplets,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  Home,
  Hospital,
  Info,
  Layers,
  LifeBuoy,
  LocateFixed,
  MapPin,
  Menu,
  Mountain,
  Navigation,
  Phone,
  PhoneCall,
  RefreshCw,
  Route,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sliders,
  Sparkles,
  Tent,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  UploadCloud,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import {
  HazardZone,
  PointOfInterest,
  RoadCorridor,
  actionChecklists,
  corridorStatusColors,
  getDataFreshness,
  hazardZones,
  nerRegions,
  pointsOfInterest,
  riskColors,
  roadCorridors,
} from '@/lib/hazard-overlays'
import {
  CitizenIncidentReport,
  getCachedHazardZones,
  getCachedPointsOfInterest,
  getCachedRoadCorridors,
  getQueuedReports,
  initializeOfflineCache,
  saveCitizenReport,
  syncPendingReports,
} from '@/lib/offline-store'

const RiskMap = dynamic(
  () => import('@/components/risk-map').then((module) => module.RiskMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[540px] flex-col items-center justify-center rounded-2xl border border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-3 font-medium">Loading Unified Northeast India Risk Map…</p>
        <p className="text-xs text-muted-foreground/70">Connecting to Google Maps GIS engine</p>
      </div>
    ),
  }
)

export function CitizenPortal() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<HazardZone>(hazardZones[2]) // Default to Sohra Ridge (East Khasi Hills)
  const [selectedCorridor, setSelectedCorridor] = useState<RoadCorridor>(roadCorridors[0])
  const [layerMode, setLayerMode] = useState<'dynamic' | 'susceptibility'>('dynamic')
  const [forecastHour, setForecastHour] = useState<number>(0) // 0, 24, 48, 72

  // Shelter & POI filter tab
  const [poiTab, setPoiTab] = useState<'all' | 'shelter' | 'hospital' | 'relief_camp'>('all')

  // Modals & Drawers
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [checklistOpen, setChecklistOpen] = useState(false)
  const [offlineStatus, setOfflineStatus] = useState<boolean>(false)
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(0)
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)

  // Geofence alert status
  const [geofenceAlert, setGeofenceAlert] = useState<{
    status: 'in-zone' | 'approaching' | 'safe'
    zoneName?: string
  }>({ status: 'safe' })

  // Checked items in safety checklist
  const [checkedActionItems, setCheckedActionItems] = useState<Record<string, boolean>>({})

  // Incident reporting form state
  const [reportForm, setReportForm] = useState<{
    hazardType: 'landslide' | 'mudflow' | 'flash_flood' | 'road_collapse' | 'river_overflow' | 'crack_formation'
    severity: 'minor' | 'moderate' | 'severe' | 'impassable'
    state: string
    district: string
    locationDescription: string
    lat: number
    lng: number
    photoPreview: string | null
    reporterContact: string
  }>({
    hazardType: 'landslide',
    severity: 'moderate',
    state: 'Assam',
    district: 'Kamrup Metro',
    locationDescription: '',
    lat: 26.145,
    lng: 91.736,
    photoPreview: null,
    reporterContact: '',
  })

  // Initialize offline caching and network monitoring
  useEffect(() => {
    initializeOfflineCache()
    setPendingReportsCount(getQueuedReports().filter((r) => r.syncStatus === 'queued_offline').length)

    const handleOnline = () => {
      setOfflineStatus(false)
      const res = syncPendingReports()
      if (res.syncedCount > 0) {
        setSyncFeedback(`Successfully synchronized ${res.syncedCount} field report(s)`)
        setTimeout(() => setSyncFeedback(null), 5000)
      }
      setPendingReportsCount(res.pendingCount)
    }

    const handleOffline = () => {
      setOfflineStatus(true)
    }

    if (typeof window !== 'undefined') {
      setOfflineStatus(!window.navigator.onLine)
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }
  }, [])

  // Manual trigger for report sync
  const handleManualSync = () => {
    const res = syncPendingReports()
    setPendingReportsCount(res.pendingCount)
    if (res.syncedCount > 0) {
      setSyncFeedback(`Synchronized ${res.syncedCount} queued report(s) to central telemetry!`)
    } else {
      setSyncFeedback('All offline records are already up to date.')
    }
    setTimeout(() => setSyncFeedback(null), 4000)
  }

  // Handle report photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReportForm((prev) => ({ ...prev, photoPreview: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Grab user GPS coordinates into reporting form
  const handleGrabGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setReportForm((prev) => ({
            ...prev,
            lat: parseFloat(pos.coords.latitude.toFixed(5)),
            lng: parseFloat(pos.coords.longitude.toFixed(5)),
            locationDescription: prev.locationDescription || 'GPS-tagged current location',
          }))
        },
        () => {
          alert('GPS location unavailable. Please enter coordinates or address manually.')
        }
      )
    }
  }

  // Submit incident report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportForm.locationDescription.trim()) {
      alert('Please describe the location or landmark.')
      return
    }

    saveCitizenReport({
      hazardType: reportForm.hazardType,
      severity: reportForm.severity,
      state: reportForm.state,
      district: reportForm.district,
      locationDescription: reportForm.locationDescription,
      lat: reportForm.lat,
      lng: reportForm.lng,
      photoUrl: reportForm.photoPreview || undefined,
      reporterContact: reportForm.reporterContact || undefined,
    })

    const pending = getQueuedReports().filter((r) => r.syncStatus === 'queued_offline').length
    setPendingReportsCount(pending)
    setReportModalOpen(false)

    setSyncFeedback(
      offlineStatus
        ? 'Report saved to device! It will auto-sync once mountain cell connectivity returns.'
        : 'Incident report verified and logged to Disaster Management Telemetry!'
    )
    setTimeout(() => setSyncFeedback(null), 5000)

    // Reset form
    setReportForm({
      hazardType: 'landslide',
      severity: 'moderate',
      state: 'Assam',
      district: 'Kamrup Metro',
      locationDescription: '',
      lat: 26.145,
      lng: 91.736,
      photoPreview: null,
      reporterContact: '',
    })
  }

  // Active checklist based on current selected zone's risk
  const currentChecklist = actionChecklists[selectedZone.risk]

  // Filtered Points of Interest for Section 19 directory
  const filteredPOIs = useMemo(() => {
    return pointsOfInterest.filter((poi) => {
      if (poiTab === 'all') return true
      if (poiTab === 'shelter') return poi.type === 'shelter'
      if (poiTab === 'hospital') return poi.type === 'hospital'
      if (poiTab === 'relief_camp') return poi.type === 'relief_camp'
      return true
    })
  }, [poiTab])

  // Freshness calculation
  const freshness = getDataFreshness(selectedZone.computedAt)

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* 1. TOP HEADER & TELEMETRY BAR */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        {/* Offline & Telemetry Alert Strip */}
        <div className="border-b border-border/60 bg-muted/60 px-4 py-1.5 text-xs">
          <div className="mx-auto flex max-w-[1550px] flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              {offlineStatus ? (
                <span className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                  <WifiOff className="size-3.5" />
                  <span>OFFLINE MODE • Operating from local cached Digital Twin</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE TELEMETRY • Real-time satellite & sensor sync</span>
                </span>
              )}

              <span className="hidden text-muted-foreground md:inline">|</span>

              <span className="hidden items-center gap-1 text-muted-foreground md:flex">
                <Clock className="size-3" />
                <span>Computed: {freshness.label}</span>
              </span>

              <span className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground lg:inline">
                {selectedZone.modelVersion}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {pendingReportsCount > 0 && (
                <button
                  onClick={handleManualSync}
                  className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
                >
                  <RefreshCw className="size-3 animate-spin" />
                  <span>{pendingReportsCount} report(s) queued offline (Sync)</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <a
                  href="tel:112"
                  className="flex items-center gap-1 rounded bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground transition hover:bg-destructive/90"
                  title="National Emergency Helpline"
                >
                  <PhoneCall className="size-3" /> 112
                </a>
                <a
                  href="tel:1070"
                  className="hidden items-center gap-1 rounded bg-orange-600 px-2 py-0.5 text-[11px] font-bold text-white transition hover:bg-orange-700 sm:flex"
                  title="State Disaster Relief Helpline"
                >
                  <Phone className="size-3" /> 1070 (SDMA)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="mx-auto flex max-w-[1550px] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black uppercase tracking-[0.22em] text-primary">
                  NER RiskWatch
                </span>
                <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold uppercase text-primary">
                  Govt Platform
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                AI Early Warning & Landslide Risk Monitoring (Northeast India)
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a className="text-foreground font-semibold" href="#map">
              Digital Twin Map
            </a>
            <a href="#shelters" className="transition hover:text-foreground">
              Safe Shelters & Hospitals
            </a>
            <a href="#corridors" className="transition hover:text-foreground">
              Corridor Safety
            </a>
            <a href="#checklist" className="transition hover:text-foreground">
              Safety Protocols
            </a>
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <button
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground shadow-sm transition hover:bg-muted"
            >
              <Camera className="size-4 text-orange-600" />
              <span>Report Hazard Offline</span>
            </button>

            <button
              onClick={() => setChecklistOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <LifeBuoy className="size-4" />
              <span>Emergency Action Checklist</span>
            </button>
          </div>

          <button
            className="rounded-lg border border-border p-2 text-muted-foreground md:hidden"
            aria-label="Open menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="size-5" />
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="border-t border-border bg-card p-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold">
              <a href="#map" onClick={() => setMenuOpen(false)}>
                Digital Twin Map
              </a>
              <a href="#shelters" onClick={() => setMenuOpen(false)}>
                Safe Shelters & Relief
              </a>
              <a href="#corridors" onClick={() => setMenuOpen(false)}>
                Road Corridors
              </a>
              <a href="#checklist" onClick={() => setMenuOpen(false)}>
                Emergency Checklist
              </a>
              <div className="flex flex-col gap-2 pt-2 border-t">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setReportModalOpen(true)
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-bold"
                >
                  <Camera className="size-4 text-orange-600" /> Report Hazard Offline
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setChecklistOpen(true)
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground"
                >
                  <LifeBuoy className="size-4" /> Emergency Checklist
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Sync feedback notification banner */}
      {syncFeedback && (
        <div className="bg-emerald-600 px-4 py-2 text-center text-xs font-bold text-white shadow-md transition">
          {syncFeedback}
        </div>
      )}

      {/* 2. DYNAMIC GEOFENCE STATUS ALERT BANNER (Section 9 & 10) */}
      <section className="border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1550px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                geofenceAlert.status === 'in-zone'
                  ? 'bg-destructive text-destructive-foreground animate-pulse'
                  : geofenceAlert.status === 'approaching'
                  ? 'bg-orange-500 text-white'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {geofenceAlert.status === 'in-zone' ? (
                <AlertOctagon className="size-5" />
              ) : geofenceAlert.status === 'approaching' ? (
                <AlertTriangle className="size-5" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide">
                  {geofenceAlert.status === 'in-zone'
                    ? 'CRITICAL ALERT: Inside Active Hazard Perimeter'
                    : geofenceAlert.status === 'approaching'
                    ? 'ADVISORY: Approaching Elevated Risk Perimeter'
                    : 'GPS LOCATION SECURE: No Active Slip Polygons Detected'}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                  Dynamic 5km Geofence
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {geofenceAlert.status === 'in-zone'
                  ? `You are inside ${geofenceAlert.zoneName || selectedZone.name}. Immediate safety precautions advised.`
                  : geofenceAlert.status === 'approaching'
                  ? `Approaching ${geofenceAlert.zoneName || selectedZone.name} within 12km. Avoid hillside parking and mountain cuts.`
                  : 'Local coordinates clear of landslide slips and flash-flood watercourses. Maintain regular monitoring.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setChecklistOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              <FileText className="size-3.5 text-primary" />
              <span>Action Steps ({selectedZone.risk.toUpperCase()})</span>
            </button>
            <a
              href="#shelters"
              className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
            >
              <Building2 className="size-3.5" />
              <span>Nearest Shelters</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. HERO & OPERATIONAL LOOP SUMMARY */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-[1550px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <span className="size-2 rounded-full bg-primary" />
                Complete Solution for Northeast India Multi-Hazard Management
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-foreground">
                AI Early Warning & Landslide Risk Monitoring Platform
              </h1>
              <p className="mt-1.5 max-w-4xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Offline-first government digital twin synthesizing weather, slope terrain, satellite change detection,
                sensor telemetry, and field verification. Delivering actionable safe routing and verified shelter access.
              </p>
            </div>

            {/* Core Loop Badge */}
            <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-border bg-card p-2 text-[10px] font-bold text-muted-foreground shadow-xs">
              <span className="text-primary">Observe</span> → 
              <span>Understand</span> → 
              <span className="text-primary">Predict</span> → 
              <span>Locate</span> → 
              <span className="text-primary">Assess</span> → 
              <span>Prioritize</span> → 
              <span className="text-primary">Act</span> → 
              <span>Verify</span> → 
              <span className="text-emerald-600 dark:text-emerald-400">Update</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN INTERACTIVE MAP & AI HAZARD ENGINE GRID */}
      <section id="map" className="mx-auto max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
          {/* MAP CONTAINER */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold sm:text-lg flex items-center gap-2">
                  <span>Northeast India Geospatial Digital Twin</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    All 8 States
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Standardized Google Maps basemap • Dynamic Multi-Trigger Hazard & Static Geological Layers
                </p>
              </div>

              {/* Mode Toggle Description */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-muted-foreground">Active Layer:</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                    layerMode === 'dynamic'
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {layerMode === 'dynamic' ? '⚡ Live Dynamic Hazard' : '🏔️ Static Susceptibility (DEM)'}
                </span>
              </div>
            </div>

            {/* Map Canvas */}
            <div className="h-[62vh] min-h-[520px] w-full">
              <RiskMap
                selectedZone={selectedZone}
                onSelectZone={(zone) => setSelectedZone(zone)}
                layerMode={layerMode}
                onToggleLayerMode={(m) => setLayerMode(m)}
                selectedCorridorId={selectedCorridor.id}
                onSelectCorridor={(corr) => setSelectedCorridor(corr)}
                onGeofenceStatusChange={(status, zoneName) =>
                  setGeofenceAlert({ status, zoneName })
                }
              />
            </div>

            {/* Legend & Summary Info */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold text-foreground">Risk States:</span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <i className="size-3 rounded-full bg-destructive" /> Critical
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <i className="size-3 rounded-full bg-orange-500" /> High
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <i className="size-3 rounded-full bg-yellow-500" /> Moderate
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <i className="size-3 rounded-full bg-emerald-500" /> Low
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px]">
                  <i className="size-2 rounded-full bg-blue-600" /> Safe Shelter
                </span>
                <span className="flex items-center gap-1 text-[11px] text-destructive">
                  <i className="size-2 rounded-full bg-red-600 animate-ping" /> Compromised POI
                </span>
              </div>
            </div>
          </div>

          {/* AI HAZARD ENGINE SIDE PANEL (Section 6 & 7) */}
          <aside className="flex flex-col gap-4">
            {/* Selected Hazard Zone Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {selectedZone.district}, {selectedZone.state}
                    </span>
                  </div>
                  <h3 className="mt-0.5 text-lg font-bold text-foreground">{selectedZone.name}</h3>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wide text-white"
                    style={{ backgroundColor: riskColors[selectedZone.risk] }}
                  >
                    {selectedZone.risk}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground capitalize">
                    {selectedZone.trend === 'increasing' ? (
                      <TrendingUp className="size-3 text-destructive" />
                    ) : (
                      <TrendingDown className="size-3 text-emerald-500" />
                    )}
                    {selectedZone.trend}
                  </span>
                </div>
              </div>

              {/* Multi-Trigger Numerical Indicators (Section 5.3) */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-border/80 bg-muted/50 p-2.5">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <CloudRain className="size-3.5 text-primary" /> 72h Rainfall
                  </span>
                  <p className="mt-1 text-lg font-extrabold text-foreground">
                    {selectedZone.multiTriggerMetrics.rainfall72h} <span className="text-xs font-normal">mm</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">24h: {selectedZone.multiTriggerMetrics.rainfall24h} mm</p>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/50 p-2.5">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Droplets className="size-3.5 text-blue-500" /> Soil Saturation
                  </span>
                  <p className="mt-1 text-lg font-extrabold text-foreground">
                    {selectedZone.multiTriggerMetrics.soilMoisturePct}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">High regolith moisture</p>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/50 p-2.5">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Mountain className="size-3.5 text-amber-600" /> Slope Angle
                  </span>
                  <p className="mt-1 text-lg font-extrabold text-foreground">
                    {selectedZone.multiTriggerMetrics.slopeAngleDeg}°
                  </p>
                  <p className="text-[10px] text-muted-foreground">Critical shear threshold</p>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/50 p-2.5">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Activity className="size-3.5 text-emerald-500" /> AI Confidence
                  </span>
                  <p className="mt-1 text-lg font-extrabold uppercase text-foreground">
                    {selectedZone.confidence}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Calibrated model</p>
                </div>
              </div>

              {/* Contributing Factors in Plain Language (Section 6) */}
              <div className="mt-4 rounded-xl bg-muted/60 p-3 text-xs">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Info className="size-3.5 text-primary" /> Plain-Language Contributing Factors:
                </p>
                <ul className="mt-2 space-y-1.5 text-muted-foreground">
                  {selectedZone.contributingFactors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exposed Assets Summary (Section 7) */}
              <div className="mt-3 flex items-center justify-between rounded-xl border border-border/70 p-2.5 text-xs">
                <span className="font-semibold text-muted-foreground">Potentially Exposed:</span>
                <div className="flex items-center gap-3 font-bold text-foreground">
                  <span>{selectedZone.exposedAssets.villagesCount} villages</span>
                  <span>{selectedZone.exposedAssets.roadsCount} roads</span>
                  <span>{selectedZone.exposedAssets.bridgesCount} bridges</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setChecklistOpen(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                <LifeBuoy className="size-4" />
                <span>View {selectedZone.risk.toUpperCase()} Action Guidance</span>
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* 72-Hour Forecast & Scenario Projection (Section 12) */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    72h Forecast Risk Scenario
                  </h4>
                </div>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  IMD Radar Model
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-muted-foreground">Time Horizon:</span>
                  <span className="font-bold text-primary">
                    {forecastHour === 0 ? 'Current (Now)' : `+${forecastHour} Hours Projection`}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted/60 p-1">
                  {[0, 24, 48, 72].map((hr) => (
                    <button
                      key={hr}
                      onClick={() => setForecastHour(hr)}
                      className={`rounded-lg py-1.5 text-xs font-bold transition ${
                        forecastHour === hr
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {hr === 0 ? 'Now' : `+${hr}h`}
                    </button>
                  ))}
                </div>

                <div className="mt-3 rounded-xl border border-border/80 bg-card p-3 text-xs">
                  {forecastHour === 0 ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Current State:</span>
                        <span
                          className="rounded px-2 py-0.5 text-[10px] font-bold text-white uppercase"
                          style={{ backgroundColor: riskColors[selectedZone.risk] }}
                        >
                          {selectedZone.risk} Risk
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        Sustained precipitation active. Live slope radar active.
                      </p>
                    </div>
                  ) : (
                    (() => {
                      const proj = selectedZone.forecastRisk.find((p) => p.hours === forecastHour)
                      if (!proj) return null
                      return (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Projected Severity:</span>
                            <span
                              className="rounded px-2 py-0.5 text-[10px] font-bold text-white uppercase"
                              style={{ backgroundColor: riskColors[proj.risk] }}
                            >
                              {proj.risk} Risk
                            </span>
                          </div>
                          <p className="mt-1 text-muted-foreground leading-relaxed">
                            {proj.triggerSummary}
                          </p>
                        </div>
                      )
                    })()
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 5. SECTION 19: SHELTER, MEDICAL & RELIEF RESOURCE LAYER (PUBLIC-FACING) */}
      <section id="shelters" className="border-t border-border bg-card py-10">
        <div className="mx-auto max-w-[1550px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Building2 className="size-4" /> Section 19 Mandate: Authority Verified Resources
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Nearest Safe Shelters, Hospitals & Active Relief Camps
              </h2>
              <p className="mt-1 max-w-3xl text-xs text-muted-foreground sm:text-sm">
                Real-time operational status (OPEN / FULL / CLOSED / UNVERIFIED) verified by DDMA & Health Departments.
                Automatically filtered against active landslide & flood geometry to prevent compromised evacuation.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/50 p-1 text-xs">
              <button
                onClick={() => setPoiTab('all')}
                className={`rounded-lg px-3 py-1.5 font-bold transition ${
                  poiTab === 'all' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Resources
              </button>
              <button
                onClick={() => setPoiTab('shelter')}
                className={`rounded-lg px-3 py-1.5 font-bold transition ${
                  poiTab === 'shelter' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Safe Shelters
              </button>
              <button
                onClick={() => setPoiTab('hospital')}
                className={`rounded-lg px-3 py-1.5 font-bold transition ${
                  poiTab === 'hospital' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Hospitals
              </button>
              <button
                onClick={() => setPoiTab('relief_camp')}
                className={`rounded-lg px-3 py-1.5 font-bold transition ${
                  poiTab === 'relief_camp' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Relief Camps
              </button>
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPOIs.map((poi) => {
              const isCompromised = poi.isCompromisedByHazard
              const isFull = poi.operationalStatus === 'full'
              const isClosed = poi.operationalStatus === 'closed'

              return (
                <div
                  key={poi.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition shadow-xs ${
                    isCompromised
                      ? 'border-destructive/60 bg-destructive/5'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div>
                    {/* Top Status Strip */}
                    <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                        <MapPin className="size-3 text-primary" /> {poi.district || poi.state}
                      </span>

                      {isCompromised ? (
                        <span className="flex items-center gap-1 rounded bg-destructive px-2 py-0.5 text-[10px] font-black text-destructive-foreground animate-pulse">
                          <AlertTriangle className="size-3" /> COMPROMISED
                        </span>
                      ) : (
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                            poi.operationalStatus === 'open'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : isFull
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {poi.operationalStatus || 'VERIFIED'}
                        </span>
                      )}
                    </div>

                    {/* Facility Title & Type */}
                    <div className="mt-2.5 flex items-start gap-2">
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                          poi.type === 'hospital'
                            ? 'bg-red-500/10 text-red-600'
                            : poi.type === 'shelter'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-sky-500/10 text-sky-600'
                        }`}
                      >
                        {poi.type === 'hospital' ? (
                          <Hospital className="size-4" />
                        ) : poi.type === 'shelter' ? (
                          <Building2 className="size-4" />
                        ) : (
                          <Tent className="size-4" />
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-foreground leading-tight">{poi.name}</h4>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{poi.description}</p>
                      </div>
                    </div>

                    {/* Compromised Alert Warning */}
                    {isCompromised && (
                      <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-[11px] font-medium text-destructive">
                        ⚠️ Safety Warning: Facility is within active hazard perimeter. Do not use as primary evacuation point.
                      </div>
                    )}

                    {/* Capacity and Occupancy Indicator */}
                    {poi.capacity && (
                      <div className="mt-3 rounded-xl bg-muted/50 p-2 text-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Live Occupancy:</span>
                          <span className="font-bold text-foreground">
                            {poi.capacity.current} / {poi.capacity.max}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                          <div
                            className={`h-full rounded-full ${
                              poi.capacity.current / poi.capacity.max > 0.85
                                ? 'bg-amber-500'
                                : 'bg-primary'
                            }`}
                            style={{
                              width: `${Math.min(100, (poi.capacity.current / poi.capacity.max) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer with Distance & Call */}
                  <div className="mt-4 border-t border-border/60 pt-3 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {poi.distanceKm ? `~${poi.distanceKm} km away` : 'Regional Hub'}
                    </span>

                    {poi.contactNumber ? (
                      <a
                        href={`tel:${poi.contactNumber}`}
                        className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-bold text-foreground transition hover:bg-primary hover:text-primary-foreground"
                      >
                        <Phone className="size-3" /> Call Facility
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        {poi.verifiedBy ? `Verified: ${poi.verifiedBy}` : 'DDMA Registered'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. SECTION 8 & 9: HIGHWAY CORRIDORS & ROUTE CONNECTIVITY INTELLIGENCE */}
      <section id="corridors" className="border-t border-border bg-muted/20 py-10">
        <div className="mx-auto max-w-[1550px] px-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Route className="size-4" /> Section 8 & 9: Connectivity & Route Safety Intelligence
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Northeast Strategic Highway Corridors & Arterial Pass Status
            </h2>
            <p className="mt-1 max-w-3xl text-xs text-muted-foreground sm:text-sm">
              Real-time operational states: NORMAL → AT RISK → THREATENED → BLOCKED. Identifies threatened mountain passes and
              provides validated detour alternatives around active landslides.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roadCorridors.map((corridor) => {
              const color = corridorStatusColors[corridor.status]
              const isSelected = selectedCorridor.id === corridor.id

              return (
                <div
                  key={corridor.id}
                  onClick={() => setSelectedCorridor(corridor)}
                  className={`flex flex-col justify-between rounded-2xl border bg-card p-5 cursor-pointer transition shadow-xs ${
                    isSelected ? 'ring-2 ring-primary border-transparent' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                      <div>
                        <span className="font-mono text-xs font-extrabold text-primary">
                          {corridor.highwayNumber}
                        </span>
                        <h4 className="font-bold text-sm text-foreground">{corridor.name}</h4>
                      </div>

                      <span
                        className="rounded px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs"
                        style={{ backgroundColor: color }}
                      >
                        {corridor.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Origin: {corridor.origin}</span>
                      <span>Length: {corridor.lengthKm} km</span>
                    </div>

                    <div className="mt-3 rounded-xl bg-destructive/10 p-2.5 text-xs">
                      <p className="font-bold text-destructive flex items-center gap-1">
                        <AlertTriangle className="size-3.5" /> Choke Point at Risk:
                      </p>
                      <p className="mt-0.5 text-muted-foreground font-medium">{corridor.chokePointName}</p>
                    </div>

                    {corridor.alternativeRouteBypass && (
                      <div className="mt-2.5 rounded-xl bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                        <p className="font-bold flex items-center gap-1">
                          <CheckCircle className="size-3.5" /> Safer Bypass Alternative:
                        </p>
                        <p className="mt-0.5 text-foreground/80 leading-relaxed font-medium">
                          {corridor.alternativeRouteBypass}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t border-border/60 pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Agency: {corridor.departmentResponsible}</span>
                    <span className="font-bold text-primary">Click to highlight on map</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 7. SECTION 19.1 & 11: EMERGENCY ACTION CHECKLIST MODAL */}
      {checklistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setChecklistOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div
                className="flex size-10 items-center justify-center rounded-xl text-white font-bold"
                style={{ backgroundColor: currentChecklist.color }}
              >
                <ShieldAlert className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{currentChecklist.title}</h3>
                <p className="text-xs text-muted-foreground">{currentChecklist.headline}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Authoritative Checklist Items (Select to track completion):
              </p>

              {currentChecklist.items.map((item) => {
                const isChecked = !!checkedActionItems[item.id]
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      isChecked
                        ? 'border-emerald-500/40 bg-emerald-500/5 line-through opacity-80'
                        : 'border-border bg-muted/40 hover:bg-muted'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setCheckedActionItems((prev) => ({ ...prev, [item.id]: e.target.checked }))
                      }
                      className="mt-0.5 size-4 rounded text-primary focus:ring-primary"
                    />
                    <div className="text-xs leading-relaxed">
                      <span className="font-semibold text-foreground capitalize">
                        [{item.category}]
                      </span>{' '}
                      <span className={isChecked ? 'text-muted-foreground' : 'text-foreground'}>
                        {item.text}
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                {Object.values(checkedActionItems).filter(Boolean).length} of {currentChecklist.items.length} completed
              </span>
              <button
                onClick={() => setChecklistOpen(false)}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Close Guidance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. SECTION 11 & 15: OFFLINE CITIZEN INCIDENT REPORTING MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 font-bold">
                <Camera className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Report Mountain Hazard Incident</h3>
                <p className="text-xs text-muted-foreground">
                  Works offline. Automatically queues locally and synchronizes once network returns.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitReport} className="mt-5 space-y-4 text-xs">
              {/* Hazard Type & Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">Hazard Type</label>
                  <select
                    value={reportForm.hazardType}
                    onChange={(e) =>
                      setReportForm((prev) => ({
                        ...prev,
                        hazardType: e.target.value as any,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-muted/60 p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="landslide">Landslide / Slope Failure</option>
                    <option value="mudflow">Mudflow / Debris Avalanche</option>
                    <option value="flash_flood">Flash Flood / River Surge</option>
                    <option value="road_collapse">Road Sinking / Cave-in</option>
                    <option value="crack_formation">Ground Tension Cracking</option>
                    <option value="river_overflow">Culvert / Bridge Washout</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-foreground">Severity Level</label>
                  <select
                    value={reportForm.severity}
                    onChange={(e) =>
                      setReportForm((prev) => ({
                        ...prev,
                        severity: e.target.value as any,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-muted/60 p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="minor">Minor (Shoulder debris, navigable)</option>
                    <option value="moderate">Moderate (Single lane restricted)</option>
                    <option value="severe">Severe (Heavy obstruction, dangerous)</option>
                    <option value="impassable">Impassable (Complete road sever / breach)</option>
                  </select>
                </div>
              </div>

              {/* State & District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground">State</label>
                  <select
                    value={reportForm.state}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, state: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-border bg-muted/60 p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {nerRegions.filter((r) => r.id !== 'all').map((r) => (
                      <option key={r.id} value={r.shortName}>
                        {r.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-foreground">District / Area</label>
                  <input
                    type="text"
                    value={reportForm.district}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, district: e.target.value }))}
                    placeholder="e.g. East Khasi Hills, Mangan"
                    className="mt-1 w-full rounded-lg border border-border bg-muted/60 p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Location Description & GPS */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground">Location Landmark</label>
                  <button
                    type="button"
                    onClick={handleGrabGps}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                  >
                    <Crosshair className="size-3" /> Auto-Detect GPS
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={reportForm.locationDescription}
                  onChange={(e) =>
                    setReportForm((prev) => ({ ...prev, locationDescription: e.target.value }))
                  }
                  placeholder="e.g. Near 29th Mile NH-10 or Wahkaba bypass bridge"
                  className="mt-1 w-full rounded-lg border border-border bg-muted/60 p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>Lat: {reportForm.lat}</span>
                  <span>•</span>
                  <span>Lng: {reportForm.lng}</span>
                </div>
              </div>

              {/* Photo Upload with Preview */}
              <div>
                <label className="font-bold text-foreground">Photo / Video Evidence</label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 cursor-pointer hover:bg-muted">
                    <UploadCloud className="size-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Choose file or snapshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {reportForm.photoPreview && (
                    <div className="flex items-center gap-2">
                      <img
                        src={reportForm.photoPreview}
                        alt="Preview"
                        className="size-10 rounded-lg object-cover border border-border"
                      />
                      <span className="text-[10px] text-emerald-600 font-bold">Image attached</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Contact Number */}
              <div>
                <label className="font-bold text-foreground">Reporter Mobile (Optional)</label>
                <input
                  type="tel"
                  value={reportForm.reporterContact}
                  onChange={(e) =>
                    setReportForm((prev) => ({ ...prev, reporterContact: e.target.value }))
                  }
                  placeholder="For DDMA search & verification team verification"
                  className="mt-1 w-full rounded-lg border border-border bg-muted/60 p-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Offline note */}
              <div className="rounded-xl bg-muted p-3 text-[11px] text-muted-foreground">
                ℹ️ <strong>Offline Verification Guarantee:</strong> This report is stored in your device's
                encrypted database and will automatically dispatch to SDMA emergency servers upon network reconnection.
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90"
                >
                  <UploadCloud className="size-3.5" /> Save & Dispatch Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. FOOTER */}
      <footer className="border-t border-border bg-card py-8 text-xs text-muted-foreground">
        <div className="mx-auto max-w-[1550px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-foreground">
                Northeast India Multi-Hazard Landslide & Flood Monitoring System
              </p>
              <p className="mt-0.5">
                Authority-approved offline-first digital twin platform covering Assam, Meghalaya, Sikkim,
                Arunachal Pradesh, Nagaland, Manipur, Mizoram, and Tripura.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <a href="/login" className="hover:text-foreground">
                Authority Portal
              </a>
              <button onClick={() => setReportModalOpen(true)} className="hover:text-foreground">
                Citizen Reporting
              </button>
              <button onClick={() => setChecklistOpen(true)} className="hover:text-foreground">
                Disaster Checklists
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
