'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Polygon, TileLayer, Tooltip, Popup, useMap } from 'react-leaflet'
import {
  Compass,
  Crosshair,
  Eye,
  Layers,
  LocateFixed,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Minus,
  Mountain,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react'
import L from 'leaflet'
import {
  HazardZone,
  PointOfInterest,
  hazardZones,
  nerRegions,
  poiColors,
  pointsOfInterest,
  riskColors,
} from '@/lib/hazard-overlays'

// Central coordinates for Northeast India
const NER_CENTER: [number, number] = [26.15, 92.9]
const NER_BOUNDS: [[number, number], [number, number]] = [
  [20.5, 87.0], // Southwest bound (Bay of Bengal / Bengal border)
  [30.2, 97.8], // Northeast bound (Arunachal / Myanmar-China border)
]

export type BasemapType = 'google-roadmap' | 'google-hybrid' | 'google-terrain' | 'carto-voyager'

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
    // Google Maps Roadmap tile server with English labels (hl=en)
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
    // Google Maps Satellite + English Roads & Labels
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
    // Google Maps Physical Terrain with contours & English labels
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

// User location marker with pulsing ring (does not hijack camera unless requested)
function UserLocationMarker({ position }: { position: [number, number] | null }) {
  if (!position) return null

  return (
    <>
      <CircleMarker
        center={position}
        radius={22}
        pathOptions={{
          color: '#2563eb',
          weight: 1.5,
          fillColor: '#3b82f6',
          fillOpacity: 0.18,
        }}
      />
      <CircleMarker
        center={position}
        radius={8}
        pathOptions={{
          color: '#ffffff',
          weight: 3,
          fillColor: '#1d4ed8',
          fillOpacity: 1,
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -10]}>
          <div className="font-semibold text-xs">Your Current Location</div>
        </Tooltip>
      </CircleMarker>
    </>
  )
}

interface RiskMapProps {
  selectedZone?: HazardZone
  onSelectZone?: (zone: HazardZone) => void
}

export function RiskMap({ selectedZone: controlledZone, onSelectZone }: RiskMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeBasemap, setActiveBasemap] = useState<BasemapType>('google-roadmap')
  const [activeRegion, setActiveRegion] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const [visibleLayers, setVisibleLayers] = useState({
    hazards: true,
    shelters: true,
    hospitals: true,
    villages: true,
    bridges: true,
    reports: true,
  })

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
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

  // Filtered points of interest based on active layer toggles
  const visiblePoints = useMemo(() => {
    return pointsOfInterest.filter((pt) => visibleLayers[`${pt.type}s` as keyof typeof visibleLayers])
  }, [visibleLayers])

  // Search results for places, cities, and hazards in Northeast India
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()

    const places = [
      ...pointsOfInterest.map((p) => ({
        id: `poi-${p.id}`,
        title: p.name,
        subtitle: `${p.state} • ${p.type.toUpperCase()}`,
        center: [p.lat, p.lng] as [number, number],
        zoom: 13,
      })),
      ...hazardZones.map((z) => ({
        id: `zone-${z.id}`,
        title: z.name,
        subtitle: `${z.state} • ${z.risk.toUpperCase()} RISK HAZARD ZONE`,
        center: z.coordinates[0] as [number, number],
        zoom: 11,
      })),
      ...nerRegions.map((r) => ({
        id: `reg-${r.id}`,
        title: r.name,
        subtitle: 'Region Focus',
        center: r.center,
        zoom: r.zoom,
      })),
    ]

    return places.filter(
      (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [searchQuery])

  // Auto-detect user location on start (places marker on map without moving camera away from NER)
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude])
        },
        () => {
          // Silent fallback: maintain NER focus
        },
        { enableHighAccuracy: false, timeout: 10000 }
      )
    }
  }, [])

  // Locate user with GPS and fly to position when clicked
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
        // Fly to user location when explicitly requested
        setCameraTarget({ center: coords, zoom: 13, timestamp: Date.now() })
      },
      (err) => {
        setIsLocating(false)
        setLocationError('Unable to retrieve GPS location. Please check browser permissions.')
        setTimeout(() => setLocationError(null), 4000)
      },
      { enableHighAccuracy: true, timeout: 12000 }
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
              placeholder="Search NER cities, shelters, zones…"
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

        {/* Region Fast-Jump Pills */}
        <div className="hidden flex-wrap gap-1 md:flex">
          {nerRegions.slice(0, 5).map((reg) => (
            <button
              key={reg.id}
              onClick={() => handleSelectRegion(reg.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm transition backdrop-blur-sm ${
                activeRegion === reg.id
                  ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                  : 'bg-card/90 text-foreground/80 hover:bg-card hover:text-foreground'
              }`}
            >
              {reg.shortName}
            </button>
          ))}
          {userLocation && (
            <button
              onClick={handleLocateUser}
              className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-600 shadow-sm hover:bg-blue-500/20 dark:text-blue-400"
              title="Fly to your detected GPS location"
            >
              <LocateFixed className="size-3" /> My Location
            </button>
          )}
          <button
            onClick={handleRecenterNER}
            className="flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium text-primary shadow-sm hover:bg-card"
            title="Focus Northeast India"
          >
            <RotateCcw className="size-3" /> Northeast India
          </button>
        </div>
      </div>

      {/* 2. TOP-RIGHT: Google Maps Layer Switcher & Map Controls */}
      <div className="absolute right-3 top-3 z-[600] flex flex-col items-end gap-2">
        {/* Basemap Switcher (Google Roadmap / Satellite / Terrain) */}
        <div className="flex items-center rounded-xl border border-border/80 bg-card/95 p-1 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveBasemap('google-roadmap')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
              activeBasemap === 'google-roadmap'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="Standard Google Street Map (Clean English Labels)"
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
            title="Google Satellite Hybrid (High-Res Aerial + English Names)"
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
            title="Google Terrain (Contours & Elevation Relief)"
          >
            <Mountain className="size-3.5" />
            <span className="hidden sm:inline">Terrain</span>
            <span className="sm:hidden">Terr</span>
          </button>
        </div>

        {/* Action Controls (Locate GPS, Recenter NER, Fullscreen) */}
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

      {/* GPS Location Alert if permission denied */}
      {locationError && (
        <div className="absolute top-16 left-1/2 z-[650] -translate-x-1/2 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground shadow-lg">
          {locationError}
        </div>
      )}

      {/* 3. CORE LEAFLET MAP CONTAINER - Unrestricted pan/scroll with initial Northeast India focus */}
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

        {/* Programmatic Camera Controller */}
        <MapCameraController targetView={cameraTarget} />

        {/* User GPS Location Marker */}
        <UserLocationMarker position={userLocation} />

        {/* Hazard Polygons */}
        {visibleLayers.hazards &&
          hazardZones.map((zone) => {
            const isSelected = activeZone.id === zone.id
            const color = riskColors[zone.risk]
            return (
              <Polygon
                key={zone.id}
                positions={zone.coordinates}
                pathOptions={{
                  color: color,
                  weight: isSelected ? 3.5 : 2,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.5 : 0.28,
                  dashArray: zone.risk === 'critical' ? '4, 4' : undefined,
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
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <strong className="text-xs">{zone.name}</strong>
                    </div>
                    <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">
                      Risk: {zone.risk} • State: {zone.state}
                    </p>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="min-w-[220px] p-1 text-foreground">
                    <div className="flex items-center justify-between border-b pb-1.5">
                      <h4 className="font-semibold text-sm">{zone.name}</h4>
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white"
                        style={{ backgroundColor: color }}
                      >
                        {zone.risk}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{zone.description}</p>
                    <div className="mt-2 text-[11px] font-medium text-primary">
                      Type: {zone.type.toUpperCase()} • State: {zone.state}
                    </div>
                  </div>
                </Popup>
              </Polygon>
            )
          })}

        {/* Points of Interest (Shelters, Hospitals, Bridges, Reports) */}
        {visiblePoints.map((poi) => {
          const color = poiColors[poi.type]
          const isSelected = poi.type === 'report'

          return (
            <CircleMarker
              key={poi.id}
              center={[poi.lat, poi.lng]}
              radius={isSelected ? 9 : 7}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: color,
                fillOpacity: 0.95,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <div className="text-xs">
                  <strong>{poi.name}</strong>
                  <div className="text-[10px] text-muted-foreground capitalize">
                    {poi.type} • {poi.state}
                  </div>
                </div>
              </Tooltip>

              <Popup>
                <div className="min-w-[200px] p-1">
                  <div className="flex items-center gap-1.5 border-b pb-1">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <strong className="text-sm font-semibold">{poi.name}</strong>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {poi.description || 'Designated safety facility in Northeast India.'}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>State: {poi.state}</span>
                    <span className="font-semibold capitalize text-primary">{poi.type}</span>
                  </div>
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
        {(['hazards', 'shelters', 'hospitals', 'villages', 'bridges', 'reports'] as const).map(
          (layer) => {
            const count =
              layer === 'hazards'
                ? hazardZones.length
                : pointsOfInterest.filter((p) => `${p.type}s` === layer).length

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
        <span>Unified NER Basemap • {currentBasemap.attribution}</span>
      </div>
    </div>
  )
}

export function mapIcon(color: string) {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `<span style="background:${color}; display:block; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 1px 4px rgba(0,0,0,0.4)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}
