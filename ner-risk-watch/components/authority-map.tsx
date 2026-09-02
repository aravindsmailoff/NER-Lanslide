'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polygon, Tooltip, useMap } from 'react-leaflet'
import { Plus, Minus, LocateFixed } from 'lucide-react'
import { hazardZones, riskColors } from '@/lib/hazard-overlays'

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
  sector?: string
}

const defaultCenter: [number, number] = [25.7, 92.5]

function MapController({ selectedIncident }: { selectedIncident: Incident | null }) {
  const map = useMap()
  useEffect(() => {
    if (selectedIncident && selectedIncident.latitude && selectedIncident.longitude) {
      map.flyTo([selectedIncident.latitude, selectedIncident.longitude], 11, {
        duration: 1.2
      })
    }
  }, [selectedIncident, map])
  return null
}

function AuthorityMapControls() {
  const map = useMap()
  return (
    <div className="absolute right-4 top-4 z-[500] flex flex-col gap-2">
      <div className="overflow-hidden rounded-xl border border-border bg-card/90 shadow-md backdrop-blur">
        <button
          type="button"
          aria-label="Zoom in"
          className="flex size-9 items-center justify-center border-b border-border text-foreground transition hover:bg-muted"
          onClick={() => map.zoomIn()}
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className="flex size-9 items-center justify-center text-foreground transition hover:bg-muted"
          onClick={() => map.zoomOut()}
        >
          <Minus className="size-4" />
        </button>
      </div>
      <button
        type="button"
        aria-label="Reset radar focus"
        className="flex size-9 items-center justify-center rounded-xl border border-border bg-card/90 text-primary shadow-md backdrop-blur transition hover:bg-muted"
        onClick={() => map.flyTo(defaultCenter, 7, { duration: 1 })}
      >
        <LocateFixed className="size-4" />
      </button>
    </div>
  )
}

export function AuthorityMap({
  incidents,
  selectedIncident,
  onSelectIncident,
}: {
  incidents: Incident[]
  selectedIncident: Incident | null
  onSelectIncident: (inc: Incident) => void
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-muted">
      <MapContainer
        center={defaultCenter}
        zoom={7}
        minZoom={5}
        maxZoom={16}
        scrollWheelZoom
        className="h-full w-full"
      >
        {/* CartoDB Dark Matter / OSM Tiles for Mission Control look */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Hazard Polygons */}
        {hazardZones.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={{
              color: riskColors[zone.risk] || '#f59e0b',
              fillColor: riskColors[zone.risk] || '#f59e0b',
              fillOpacity: 0.25,
              weight: 2,
            }}
          >
            <Tooltip>
              <div className="font-sans text-xs">
                <p className="font-bold">{zone.name}</p>
                <p className="capitalize text-muted-foreground">{zone.type} Watch · {zone.risk} risk</p>
              </div>
            </Tooltip>
          </Polygon>
        ))}

        {/* Realtime Incident Markers */}
        {incidents.map((incident) => {
          if (!incident.latitude || !incident.longitude) return null
          const isSelected = selectedIncident?.id === incident.id
          const color =
            incident.status === 'RESOLVED'
              ? '#10b981'
              : incident.urgency === 'critical'
              ? '#ef4444'
              : '#f59e0b'

          return (
            <CircleMarker
              key={incident.id}
              center={[incident.latitude, incident.longitude]}
              radius={isSelected ? 11 : incident.urgency === 'critical' ? 9 : 7}
              pathOptions={{
                color: isSelected ? '#ffffff' : color,
                weight: isSelected ? 3 : 2,
                fillColor: color,
                fillOpacity: 0.95,
              }}
              eventHandlers={{
                click: () => onSelectIncident(incident),
              }}
            >
              <Tooltip permanent={isSelected} direction="top" offset={[0, -8]}>
                <div className="font-sans text-xs">
                  <strong className="block">{incident.fullName}</strong>
                  <span>{incident.landmark}</span>
                  <div className="mt-0.5 font-bold uppercase text-[10px]" style={{ color }}>
                    {incident.urgency} · {incident.status}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}

        <MapController selectedIncident={selectedIncident} />
        <AuthorityMapControls />
      </MapContainer>
    </div>
  )
}
