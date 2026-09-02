'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Polygon, Polyline, TileLayer, Tooltip, Popup, useMap } from 'react-leaflet'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Crosshair,
  Eye,
  Layers,
  LocateFixed,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Mountain,
  Navigation,
  RotateCcw,
  Route,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import L from 'leaflet'
import {
  HazardZone,
  PointOfInterest,
  RoadCorridor,
  corridorStatusColors,
  hazardZones,
  nerRegions,
  poiColors,
  pointsOfInterest,
  riskColors,
  roadCorridors,
} from '@/lib/hazard-overlays'

// Central coordinates for Northeast India
const NER_CENTER: [number, number] = [26.15, 92.9]

export type BasemapType = 'google-roadmap' | 'google-hybrid' | 'google-terrain' | 'carto-voyager'
export type HazardLayerMode = 'dynamic' | 'susceptibility'

interface BasemapConfig {
  id: BasemapType
  name: string
  label: string
  icon: 'map' | 'satellite' | 'mountain'
  url: string
  subdomains: string[]
  attribution: string
  maxZoom: number
}

const BASEMAP_CONFIGS: Record<BasemapType, BasemapConfig> = {
  'google-roadmap': {
    id: 'google-roadmap',
    name: 'Google Roadmap',
    label: 'Standard',
    icon: 'map',
    url: 'https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  'google-hybrid': {
    id: 'google-hybrid',
    name: 'Google Satellite Hybrid',
    label: 'Satellite',
    icon: 'satellite',
    url: 'https://mt{s}.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps Satellite',
    maxZoom: 20,
  },
  'google-terrain': {
    id: 'google-terrain',
    name: 'Google Terrain',
    label: 'Terrain',
    icon: 'mountain',
    url: 'https://mt{s}.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps Terrain',
    maxZoom: 20,
  },
  'carto-voyager': {
    id: 'carto-voyager',
    name: 'CartoDB Voyager (English)',
    label: 'Voyager',
    icon: 'map',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    maxZoom: 19,
  },
}

// Helper to compute susceptibility color gradient (0 to 100)
function getSusceptibilityColor(score: number): string {
  if (score >= 85) return '#7f1d1d' // extremely high terrain slope/fragility (dark red-brown)
  if (score >= 70) return '#c2410c' // high
  if (score >= 50) return '#b45309' // moderate
  return '#15803d' // low
}

// Controller component to handle programmatic map camera movements
function MapCameraController({
  targetView,
}: {
  targetView: { center: [number, number]; zoom: number; timestamp: number } | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!targetView) return
    map.flyTo(targetView.center, targetView.zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    })
  }, [targetView, map])

  return null
}

// User location marker with dynamic geofence ring
function UserLocationMarker({
  position,
  proximityStatus,
  nearestHazardName,
}: {
  position: [number, number] | null
  proximityStatus: 'in-zone' | 'approaching' | 'safe'
  nearestHazardName?: string
}) {
  if (!position) return null

  const ringColor =
    proximityStatus === 'in-zone' ? '#dc2626' : proximityStatus === 'approaching' ? '#ea580c' : '#2563eb'

  return (
    <>
      {/* 5km dynamic geofence proximity buffer */}
      <CircleMarker
        center={position}
        radius={35}
        pathOptions={{
          color: ringColor,
          weight: proximityStatus === 'safe' ? 1.5 : 2.5,
          fillColor: ringColor,
          fillOpacity: proximityStatus === 'safe' ? 0.12 : 0.25,
          dashArray: proximityStatus === 'approaching' ? '6, 4' : undefined,
        }}
      />

      {/* Center pinpoint */}
      <CircleMarker
        center={position}
        radius={9}
        pathOptions={{
          color: '#ffffff',
          weight: 3,
          fillColor: ringColor,
          fillOpacity: 1,
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -12]}>
          <div className="flex flex-col items-center">
            <span className="font-bold text-[11px] text-foreground">You Are Here</span>
            {proximityStatus === 'in-zone' && (
              <span className="rounded bg-destructive px-1 text-[9px] font-extrabold text-destructive-foreground">
                INSIDE HAZARD ZONE
              </span>
            )}
            {proximityStatus === 'approaching' && (
              <span className="rounded bg-orange-500 px-1 text-[9px] font-extrabold text-white">
                APPROACHING {nearestHazardName || 'HAZARD'}
              </span>
            )}
            {proximityStatus === 'safe' && (
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Clear of Active Polygons
              </span>
            )}
          </div>
        </Tooltip>
      </CircleMarker>
    </>
  )
}

interface RiskMapProps {
  selectedZone?: HazardZone
  onSelectZone?: (zone: HazardZone) => void
  layerMode?: HazardLayerMode
  onToggleLayerMode?: (mode: HazardLayerMode) => void
  selectedCorridorId?: string | null
  onSelectCorridor?: (corridor: RoadCorridor) => void
  onGeofenceStatusChange?: (status: 'in-zone' | 'approaching' | 'safe', zoneName?: string) => void
}

export function RiskMap({
  selectedZone: controlledZone,
  onSelectZone,
  layerMode: controlledLayerMode,
  onToggleLayerMode,
  selectedCorridorId,
  onSelectCorridor,
  onGeofenceStatusChange,
}: RiskMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeBasemap, setActiveBasemap] = useState<BasemapType>('google-roadmap')
  const [activeRegion, setActiveRegion] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // Internal layer mode fallback if not controlled
  const [internalLayerMode, setInternalLayerMode] = useState<HazardLayerMode>('dynamic')
  const layerMode = controlledLayerMode || internalLayerMode

  const handleSetLayerMode = (mode: HazardLayerMode) => {
    setInternalLayerMode(mode)
    if (onToggleLayerMode) onToggleLayerMode(mode)
  }

  const [visibleLayers, setVisibleLayers] = useState({
    hazards: true,
    corridors: true,
    shelters: true,
    hospitals: true,
    villages: true,
    bridges: true,
    reports: true,
  })

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [proximityStatus, setProximityStatus] = useState<'in-zone' | 'approaching' | 'safe'>('safe')
  const [nearestZoneName, setNearestZoneName] = useState<string | undefined>()
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const [internalSelectedZone, setInternalSelectedZone] = useState<HazardZone>(hazardZones[0])
  const activeZone = controlledZone || internalSelectedZone

  // Camera target for programmatic flying
  const [cameraTarget, setCameraTarget] = useState<{
    center: [number, number]
    zoom: number
    timestamp: number
  } | null>(null)

  // Calculate geofence status whenever user location changes
  useEffect(() => {
    if (!userLocation) return

    const [uLat, uLng] = userLocation
    let status: 'in-zone' | 'approaching' | 'safe' = 'safe'
    let matchedName: string | undefined

    // Simple approximate distance check to all hazard zones
    for (const zone of hazardZones) {
      // Calculate approximate centroid
      const cLat = zone.coordinates.reduce((sum, c) => sum + c[0], 0) / zone.coordinates.length
      const cLng = zone.coordinates.reduce((sum, c) => sum + c[1], 0) / zone.coordinates.length

      // Approx Euclidean distance in degrees
      const d = Math.sqrt(Math.pow(uLat - cLat, 2) + Math.pow(uLng - cLng, 2))
      const approxKm = d * 111

      if (approxKm < 8) {
        status = 'in-zone'
        matchedName = zone.name
        break
      } else if (approxKm < 25) {
        status = 'approaching'
        matchedName = zone.name
      }
    }

    setProximityStatus(status)
    setNearestZoneName(matchedName)
    if (onGeofenceStatusChange) {
      onGeofenceStatusChange(status, matchedName)
    }
  }, [userLocation, onGeofenceStatusChange])

  // Filtered points of interest based on active layer toggles
  const visiblePoints = useMemo(() => {
    return pointsOfInterest.filter((pt) => {
      if (pt.type === 'relief_camp') return visibleLayers.shelters
      return visibleLayers[`${pt.type}s` as keyof typeof visibleLayers]
    })
  }, [visibleLayers])

  // Search results for places, cities, and hazards in Northeast India
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()

    const places = [
      ...roadCorridors.map((c) => ({
        id: `corridor-${c.id}`,
        title: `${c.highwayNumber}: ${c.name}`,
        subtitle: `Corridor • Status: ${c.status}`,
        center: c.coordinates[1] || c.coordinates[0],
        zoom: 10,
      })),
      ...pointsOfInterest.map((p) => ({
        id: `poi-${p.id}`,
        title: p.name,
        subtitle: `${p.state} • ${p.type.toUpperCase()}${p.isCompromisedByHazard ? ' (HAZARD COMPROMISED)' : ''}`,
        center: [p.lat, p.lng] as [number, number],
        zoom: 13,
      })),
      ...hazardZones.map((z) => ({
        id: `zone-${z.id}`,
        title: z.name,
        subtitle: `${z.state} • ${z.risk.toUpperCase()} RISK (${z.type.toUpperCase()})`,
        center: z.coordinates[0] as [number, number],
        zoom: 11,
      })),
      ...nerRegions.map((r) => ({
        id: `reg-${r.id}`,
        title: r.name,
        subtitle: 'State Region Focus',
        center: r.center,
        zoom: r.zoom,
      })),
    ]

    return places.filter(
      (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [searchQuery])

  // Auto-detect user location on start
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude])
        },
        () => {
          // Default to Guwahati for demo location if browser permission fails
          setUserLocation([26.155, 91.765])
        },
        { enableHighAccuracy: false, timeout: 8000 }
      )
    }
  }, [])

  // Locate user with GPS and fly to position
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }
    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(coords)
        setIsLocating(false)
        setCameraTarget({ center: coords, zoom: 13, timestamp: Date.now() })
      },
      () => {
        setIsLocating(false)
        // Fallback to active region center
        const fallback = [26.155, 91.765] as [number, number]
        setUserLocation(fallback)
        setCameraTarget({ center: fallback, zoom: 12, timestamp: Date.now() })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Jump to specific region
  const handleSelectRegion = (regionId: string) => {
    setActiveRegion(regionId)
    const region = nerRegions.find((r) => r.id === regionId)
    if (region) {
      setCameraTarget({ center: region.center, zoom: region.zoom, timestamp: Date.now() })
    }
  }

  // Recenter map back to unified Northeast India
  const handleRecenterNER = () => {
    setActiveRegion('all')
    setCameraTarget({ center: NER_CENTER, zoom: 7, timestamp: Date.now() })
  }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  const currentBasemap = BASEMAP_CONFIGS[activeBasemap]

  return (
    <div
      ref={containerRef}
      className={`relative h-full min-h-[540px] w-full overflow-hidden rounded-2xl border border-border bg-slate-100 shadow-md ${
        isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : ''
      }`}
    >
      {/* 1. TOP-LEFT: Quick Region Selector & Unified Search Bar */}
      <div className="absolute left-3 top-3 z-[600] flex max-w-[94%] flex-col gap-2 sm:max-w-md">
        {/* Search / Region Bar */}
        <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur-md">
          <div className="relative flex flex-1 items-center">
            <Search className="absolute left-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search NER towns, shelters, NH corridors…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              className="h-8 w-full rounded-lg bg-transparent pl-8 pr-7 text-xs font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery('')
                  setSearchOpen(false)
                }}
                className="absolute right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Region Dropdown */}
          <select
            value={activeRegion}
            onChange={(e) => handleSelectRegion(e.target.value)}
            className="h-8 rounded-lg border border-border bg-muted/60 px-2 text-xs font-semibold text-foreground focus:outline-none"
            aria-label="Select Northeast Region"
          >
            {nerRegions.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.shortName}
              </option>
            ))}
          </select>
        </div>

        {/* Search Dropdown Results */}
        {searchOpen && searchResults.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-card/98 shadow-2xl backdrop-blur-md">
            <div className="p-1">
              {searchResults.map((res) => (
                <button
                  key={res.id}
                  onClick={() => {
                    setCameraTarget({ center: res.center, zoom: res.zoom, timestamp: Date.now() })
                    setSearchOpen(false)
                    setSearchQuery(res.title)
                  }}
                  className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition hover:bg-muted"
                >
                  <span className="text-xs font-semibold text-foreground">{res.title}</span>
                  <span className="text-[10px] text-muted-foreground">{res.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Static Susceptibility vs Dynamic Hazard Switcher Pill (Section 5 Architecture) */}
        <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-card/95 p-1 shadow-md backdrop-blur-md">
          <button
            onClick={() => handleSetLayerMode('dynamic')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
              layerMode === 'dynamic'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="Section 5.2: Multi-trigger dynamic hazard recomputed from live rain, saturation, and river flows"
          >
            <Sparkles className="size-3" /> Dynamic Hazard
          </button>
          <button
            onClick={() => handleSetLayerMode('susceptibility')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
              layerMode === 'susceptibility'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="Section 5.1: Permanent terrain, slope, DEM, and geological susceptibility background"
          >
            <Mountain className="size-3" /> Static Susceptibility
          </button>
        </div>
      </div>

      {/* 2. TOP-RIGHT: Google Maps Layer Switcher & Map Controls */}
      <div className="absolute right-3 top-3 z-[600] flex flex-col items-end gap-2">
        {/* Basemap Switcher */}
        <div className="flex items-center rounded-xl border border-border/80 bg-card/95 p-1 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveBasemap('google-roadmap')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              activeBasemap === 'google-roadmap'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="Google Street Map"
          >
            <MapIcon className="size-3.5" />
            <span className="hidden sm:inline">Google Map</span>
            <span className="sm:hidden">Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBasemap('google-hybrid')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              activeBasemap === 'google-hybrid'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="Google Satellite Hybrid"
          >
            <Eye className="size-3.5" />
            <span className="hidden sm:inline">Satellite</span>
            <span className="sm:hidden">Sat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBasemap('google-terrain')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              activeBasemap === 'google-terrain'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="Google Terrain (Elevation Contours)"
          >
            <Mountain className="size-3.5" />
            <span className="hidden sm:inline">Terrain</span>
            <span className="sm:hidden">Terr</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card/95 shadow-xl backdrop-blur-md">
          <button
            aria-label="Center on Northeast India"
            onClick={handleRecenterNER}
            className="flex size-9 items-center justify-center border-b border-border/60 text-foreground transition hover:bg-muted hover:text-primary"
            title="Center Northeast India (Unified View)"
          >
            <Compass className="size-4" />
          </button>

          <button
            aria-label="Locate my position"
            onClick={handleLocateUser}
            disabled={isLocating}
            className="flex size-9 items-center justify-center border-b border-border/60 text-foreground transition hover:bg-muted hover:text-primary disabled:opacity-50"
            title="Locate my position with GPS"
          >
            <LocateFixed className={`size-4 ${isLocating ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            aria-label="Toggle Fullscreen"
            onClick={toggleFullscreen}
            className="flex size-9 items-center justify-center text-foreground transition hover:bg-muted hover:text-primary"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* GPS Location Notification */}
      {locationError && (
        <div className="absolute top-16 left-1/2 z-[650] -translate-x-1/2 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground shadow-lg">
          {locationError}
        </div>
      )}

      {/* 3. CORE LEAFLET MAP CONTAINER */}
      <MapContainer
        center={NER_CENTER}
        zoom={7}
        minZoom={3}
        maxZoom={currentBasemap.maxZoom}
        scrollWheelZoom={true}
        className="h-full w-full outline-none"
      >
        {/* Dynamic Basemap Tile Layer */}
        <TileLayer
          key={activeBasemap}
          url={currentBasemap.url}
          subdomains={currentBasemap.subdomains}
          attribution={currentBasemap.attribution}
          maxZoom={currentBasemap.maxZoom}
        />

        {/* Camera Controller */}
        <MapCameraController targetView={cameraTarget} />

        {/* User GPS Location Marker with Dynamic Geofence */}
        <UserLocationMarker
          position={userLocation}
          proximityStatus={proximityStatus}
          nearestHazardName={nearestZoneName}
        />

        {/* Road Corridors (Section 7, 8 & 9 Connectivity Intelligence) */}
        {visibleLayers.corridors &&
          roadCorridors.map((corridor) => {
            const isSelected = selectedCorridorId === corridor.id
            const color = corridorStatusColors[corridor.status]

            return (
              <Polyline
                key={corridor.id}
                positions={corridor.coordinates}
                pathOptions={{
                  color: color,
                  weight: isSelected ? 6 : 4,
                  opacity: 0.9,
                  dashArray: corridor.status === 'THREATENED' ? '8, 6' : corridor.status === 'BLOCKED' ? '4, 4' : undefined,
                }}
                eventHandlers={{
                  click: () => {
                    if (onSelectCorridor) onSelectCorridor(corridor)
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -5]}>
                  <div className="p-1">
                    <div className="flex items-center gap-1.5">
                      <Route className="size-3" style={{ color }} />
                      <strong className="text-xs">{corridor.highwayNumber}: {corridor.name}</strong>
                    </div>
                    <p className="mt-0.5 text-[10px] font-semibold text-foreground">
                      Status: <span style={{ color }}>{corridor.status}</span> • Choke Point: {corridor.chokePointName}
                    </p>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="min-w-[240px] p-1 text-foreground">
                    <div className="flex items-center justify-between border-b pb-1.5">
                      <div>
                        <h4 className="font-semibold text-sm">{corridor.highwayNumber}</h4>
                        <p className="text-[11px] text-muted-foreground">{corridor.name}</p>
                      </div>
                      <span
                        className="rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                        style={{ backgroundColor: color }}
                      >
                        {corridor.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs">
                      <p className="font-semibold text-destructive">⚠️ Active Choke Point:</p>
                      <p className="text-muted-foreground">{corridor.chokePointName}</p>
                    </div>

                    {corridor.alternativeRouteBypass && (
                      <div className="mt-2 rounded bg-emerald-500/10 p-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                        <strong>Safer Alternative:</strong> {corridor.alternativeRouteBypass}
                      </div>
                    )}

                    <div className="mt-2 text-[10px] text-muted-foreground border-t pt-1">
                      Agency: {corridor.departmentResponsible}
                    </div>
                  </div>
                </Popup>
              </Polyline>
            )
          })}

        {/* Hazard Polygons (Section 5: Static Susceptibility vs Dynamic Hazard) */}
        {visibleLayers.hazards &&
          hazardZones.map((zone) => {
            const isSelected = activeZone.id === zone.id
            const isSusceptibilityMode = layerMode === 'susceptibility'

            // In susceptibility mode, use static terrain score; in dynamic mode, use real-time risk color
            const color = isSusceptibilityMode
              ? getSusceptibilityColor(zone.susceptibilityScore)
              : riskColors[zone.risk]

            return (
              <Polygon
                key={zone.id}
                positions={zone.coordinates}
                pathOptions={{
                  color: color,
                  weight: isSelected ? 4 : 2,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.55 : isSusceptibilityMode ? 0.38 : 0.28,
                  dashArray: !isSusceptibilityMode && zone.risk === 'critical' ? '5, 5' : undefined,
                }}
                eventHandlers={{
                  click: () => {
                    setInternalSelectedZone(zone)
                    if (onSelectZone) onSelectZone(zone)
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -5]}>
                  <div className="p-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <strong className="text-xs">{zone.name}</strong>
                    </div>
                    {isSusceptibilityMode ? (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Geological Susceptibility: <strong>{zone.susceptibilityScore}/100</strong> (Terrain/DEM baseline)
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Live Risk: <strong className="capitalize">{zone.risk}</strong> • Trend: {zone.trend}
                      </p>
                    )}
                  </div>
                </Tooltip>

                <Popup>
                  <div className="min-w-[240px] p-1 text-foreground">
                    <div className="flex items-center justify-between border-b pb-1.5">
                      <h4 className="font-semibold text-sm">{zone.name}</h4>
                      <span
                        className="rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                        style={{ backgroundColor: color }}
                      >
                        {isSusceptibilityMode ? `Susceptibility: ${zone.susceptibilityScore}` : zone.risk}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{zone.description}</p>

                    <div className="mt-2 rounded bg-muted/60 p-2 text-[11px]">
                      <p className="font-semibold">Contributing Factors:</p>
                      <ul className="mt-1 list-disc pl-4 space-y-0.5 text-muted-foreground">
                        {zone.contributingFactors.slice(0, 2).map((factor, idx) => (
                          <li key={idx}>{factor}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-primary">
                      <span>Type: {zone.type.toUpperCase()}</span>
                      <span>Confidence: {zone.confidence.toUpperCase()}</span>
                    </div>
                  </div>
                </Popup>
              </Polygon>
            )
          })}

        {/* Points of Interest with Section 19 Shelter Safety Badges */}
        {visiblePoints.map((poi) => {
          const isCompromised = poi.isCompromisedByHazard
          const color = isCompromised ? '#dc2626' : poiColors[poi.type]
          const isShelter = poi.type === 'shelter' || poi.type === 'relief_camp'

          return (
            <CircleMarker
              key={poi.id}
              center={[poi.lat, poi.lng]}
              radius={isShelter ? 9 : 7}
              pathOptions={{
                color: isCompromised ? '#ef4444' : '#ffffff',
                weight: isCompromised ? 3 : 2,
                fillColor: color,
                fillOpacity: 0.95,
                dashArray: isCompromised ? '3, 3' : undefined,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <div className="text-xs">
                  <div className="flex items-center gap-1">
                    {isCompromised ? (
                      <AlertTriangle className="size-3 text-destructive" />
                    ) : (
                      <CheckCircle2 className="size-3 text-blue-600" />
                    )}
                    <strong>{poi.name}</strong>
                  </div>
                  <div className="text-[10px] text-muted-foreground capitalize">
                    {poi.type.replace('_', ' ')} • {poi.state}
                    {isCompromised && ' • ⚠️ HAZARD COMPROMISED'}
                  </div>
                </div>
              </Tooltip>

              <Popup>
                <div className="min-w-[220px] p-1">
                  <div className="flex items-center gap-1.5 border-b pb-1">
                    <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <strong className="text-sm font-semibold">{poi.name}</strong>
                  </div>

                  {isCompromised && (
                    <div className="mt-2 flex items-center gap-1.5 rounded bg-destructive/10 p-2 text-xs font-semibold text-destructive">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>HAZARD COMPROMISED: Located inside active landslide/flood zone. Seek alternative shelter.</span>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-muted-foreground">
                    {poi.description || 'Government-coordinated facility in Northeast India.'}
                  </div>

                  {poi.capacity && (
                    <div className="mt-2 flex items-center justify-between rounded bg-muted/60 px-2 py-1 text-[11px]">
                      <span>Occupancy:</span>
                      <strong className="text-foreground">{poi.capacity.current} / {poi.capacity.max} persons</strong>
                    </div>
                  )}

                  {poi.operationalStatus && (
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-bold uppercase ${
                        poi.operationalStatus === 'open' ? 'text-emerald-600' :
                        poi.operationalStatus === 'full' ? 'text-amber-600' :
                        poi.operationalStatus === 'closed' ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {poi.operationalStatus}
                      </span>
                    </div>
                  )}

                  {poi.verifiedBy && (
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      Verified by: {poi.verifiedBy}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* 4. BOTTOM-LEFT: Unified Overlays Filter Badges */}
      <div className="absolute bottom-3 left-3 z-[600] flex max-w-[94%] flex-wrap items-center gap-1.5 rounded-xl border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur-md">
        <span className="mr-1 hidden text-[11px] font-semibold text-muted-foreground sm:inline">
          Layers:
        </span>
        {(['hazards', 'corridors', 'shelters', 'hospitals', 'villages', 'bridges', 'reports'] as const).map(
          (layer) => {
            const count =
              layer === 'hazards'
                ? hazardZones.length
                : layer === 'corridors'
                ? roadCorridors.length
                : pointsOfInterest.filter((p) => {
                    if (layer === 'shelters') return p.type === 'shelter' || p.type === 'relief_camp'
                    return `${p.type}s` === layer
                  }).length

            return (
              <button
                key={layer}
                onClick={() =>
                  setVisibleLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
                }
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium capitalize transition ${
                  visibleLayers[layer]
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                }`}
              >
                <span>{layer}</span>
                <span
                  className={`rounded-full px-1 text-[9px] font-bold ${
                    visibleLayers[layer]
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-background text-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          }
        )}
      </div>

      {/* 5. BOTTOM-RIGHT: Attribution badge */}
      <div className="absolute bottom-3 right-3 z-[600] hidden items-center rounded-md border border-border/60 bg-card/90 px-2 py-0.5 text-[10px] text-muted-foreground shadow backdrop-blur-sm sm:flex">
        <span>Unified NER Digital Twin • v2.4</span>
      </div>
    </div>
  )
}
