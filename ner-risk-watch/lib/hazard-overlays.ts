// Demo hazard overlay data for Northeast India
// This is placeholder data; replace with live API calls to a hazard feed

export interface HazardZone {
  id: string;
  name: string;
  type: 'landslide' | 'flood' | 'rainfall';
  risk: 'critical' | 'high' | 'moderate' | 'low';
  coordinates: [number, number][];
  description: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'village' | 'bridge' | 'road' | 'report';
  lat: number;
  lng: number;
  description?: string;
}

// Irregular hazard zone polygons (representative for NE India region)
export const hazardZones: HazardZone[] = [
  {
    id: 'zone-1',
    name: 'Assam Foothills - High Risk',
    type: 'landslide',
    risk: 'high',
    coordinates: [
      [26.2, 91.8],
      [26.3, 91.9],
      [26.25, 92.1],
      [26.1, 92.0],
    ],
    description: 'Steep terrain in foothills with recent monsoon activity',
  },
  {
    id: 'zone-2',
    name: 'Manipur Valley - Moderate Risk',
    type: 'flood',
    risk: 'moderate',
    coordinates: [
      [24.8, 94.8],
      [24.9, 94.9],
      [24.95, 94.85],
      [24.85, 94.75],
    ],
    description: 'Low-lying valley areas prone to seasonal flooding',
  },
  {
    id: 'zone-3',
    name: 'Meghalaya Plateau - Critical',
    type: 'rainfall',
    risk: 'critical',
    coordinates: [
      [25.3, 91.8],
      [25.5, 91.9],
      [25.4, 92.0],
      [25.2, 91.95],
    ],
    description: 'Highest rainfall region; acute landslide and flood risk',
  },
  {
    id: 'zone-4',
    name: 'Mizoram Mountains - High Risk',
    type: 'landslide',
    risk: 'high',
    coordinates: [
      [23.2, 92.5],
      [23.4, 92.6],
      [23.35, 92.8],
      [23.1, 92.7],
    ],
    description: 'Mountainous terrain with unstable slopes during monsoon',
  },
];

// Points of interest (shelters, hospitals, villages, etc.)
export const pointsOfInterest: PointOfInterest[] = [
  {
    id: 'shelter-1',
    name: 'Guwahati Relief Shelter',
    type: 'shelter',
    lat: 26.1445,
    lng: 91.7362,
    description: 'Capacity: 500 persons',
  },
  {
    id: 'shelter-2',
    name: 'Imphal Community Center',
    type: 'shelter',
    lat: 24.817,
    lng: 94.9042,
    description: 'Capacity: 300 persons',
  },
  {
    id: 'hospital-1',
    name: 'Assam Medical College & Hospital',
    type: 'hospital',
    lat: 26.1852,
    lng: 91.7855,
    description: '24/7 Emergency Services',
  },
  {
    id: 'hospital-2',
    name: 'Shillong Civil Hospital',
    type: 'hospital',
    lat: 25.5788,
    lng: 91.8933,
    description: '24/7 Emergency Services',
  },
  {
    id: 'village-1',
    name: 'Khundian',
    type: 'village',
    lat: 26.25,
    lng: 91.95,
    description: 'Population: ~2,500',
  },
  {
    id: 'village-2',
    name: 'Thenzawl',
    type: 'village',
    lat: 23.25,
    lng: 92.65,
    description: 'Population: ~3,200',
  },
  {
    id: 'bridge-1',
    name: 'Brahmaputra Bridge',
    type: 'bridge',
    lat: 26.165,
    lng: 91.76,
    description: 'Critical transport link',
  },
  {
    id: 'report-1',
    name: 'Recent Landslide - June 5',
    type: 'report',
    lat: 26.28,
    lng: 91.92,
    description: '3 families affected, 1 road blocked',
  },
];

// Risk color scheme
export const riskColors: Record<HazardZone['risk'], string> = {
  critical: '#dc2626', // red
  high: '#ea580c', // orange
  moderate: '#eab308', // yellow
  low: '#22c55e', // green
};

// POI icon colors
export const poiColors: Record<PointOfInterest['type'], string> = {
  shelter: '#3b82f6', // blue
  hospital: '#ef4444', // red
  village: '#8b5cf6', // purple
  bridge: '#f59e0b', // amber
  road: '#10b981', // teal
  report: '#f97316', // orange
};
