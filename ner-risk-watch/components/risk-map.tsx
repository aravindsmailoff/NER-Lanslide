'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Polygon, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { LocateFixed, Minus, Plus } from 'lucide-react'
import L from 'leaflet'
import { hazardZones, pointsOfInterest, poiColors, riskColors } from '@/lib/hazard-overlays'

const northeastIndia: [number, number] = [25.5, 92.1]

function MapControls({ onLocate, locating }: { onLocate: () => void; locating: boolean }) {
  const map = useMap()
  return (
    <div className="absolute right-4 top-4 z-[500] flex flex-col gap-2">
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        <button aria-label="Zoom in" className="flex size-10 items-center justify-center border-b border-border text-foreground transition hover:bg-muted" onClick={() => map.zoomIn()}><Plus /></button>
        <button aria-label="Zoom out" className="flex size-10 items-center justify-center text-foreground transition hover:bg-muted" onClick={() => map.zoomOut()}><Minus /></button>
      </div>
      <button aria-label="Use my location" className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-lg transition hover:bg-muted disabled:opacity-60" onClick={onLocate} disabled={locating}><LocateFixed /></button>
    </div>
  )
}

function LocationMarker({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => { if (position) map.flyTo(position, 12, { duration: 1.2 }) }, [position, map])
  if (!position) return null
  return <CircleMarker center={position} radius={10} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#0f766e', fillOpacity: 1 }}><Tooltip permanent direction="top" offset={[0, -8]}>Your location</Tooltip></CircleMarker>
}

export function RiskMap() {
  const [visibleLayers, setVisibleLayers] = useState({ hazards: true, shelters: true, hospitals: false, villages: false, bridges: false, reports: true })
  const [location, setLocation] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [selectedZone, setSelectedZone] = useState(hazardZones[2])
  const visiblePoints = useMemo(() => pointsOfInterest.filter((point) => visibleLayers[`${point.type}s` as keyof typeof visibleLayers]), [visibleLayers])

  function locate() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition((position) => { setLocation([position.coords.latitude, position.coords.longitude]); setLocating(false) }, () => setLocating(false), { enableHighAccuracy: true, timeout: 10000 })
  }

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
      <MapContainer center={northeastIndia} zoom={7} minZoom={5} maxZoom={15} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {visibleLayers.hazards && hazardZones.map((zone) => <Polygon key={zone.id} positions={zone.coordinates} pathOptions={{ color: riskColors[zone.risk], fillColor: riskColors[zone.risk], fillOpacity: selectedZone.id === zone.id ? 0.45 : 0.25, weight: selectedZone.id === zone.id ? 3 : 1.5 }} eventHandlers={{ click: () => setSelectedZone(zone) }}><Tooltip>{zone.name}</Tooltip></Polygon>)}
        {visiblePoints.map((point) => <CircleMarker key={point.id} center={[point.lat, point.lng]} radius={point.type === 'report' ? 8 : 7} pathOptions={{ color: '#fff', weight: 2, fillColor: poiColors[point.type], fillOpacity: 0.95 }}><Tooltip><strong>{point.name}</strong>{point.description && <><br />{point.description}</>}</Tooltip></CircleMarker>)}
        <LocationMarker position={location} />
        <MapControls onLocate={locate} locating={locating} />
      </MapContainer>
      <div className="absolute bottom-4 left-4 z-[500] flex flex-wrap gap-2 rounded-lg border border-border bg-card/95 p-2 shadow-lg backdrop-blur">
        {(['hazards', 'shelters', 'hospitals', 'villages', 'bridges', 'reports'] as const).map((layer) => <button key={layer} onClick={() => setVisibleLayers((current) => ({ ...current, [layer]: !current[layer] }))} className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${visibleLayers[layer] ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{layer}</button>)}
      </div>
    </div>
  )
}

export function mapIcon(color: string) { return L.divIcon({ className: 'custom-map-icon', html: `<span style="background:${color}"></span>`, iconSize: [18, 18], iconAnchor: [9, 9] }) }
