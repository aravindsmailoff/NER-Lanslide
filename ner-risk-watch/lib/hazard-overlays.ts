// Demo hazard overlay data for Northeast India (all 8 NER states)

export interface HazardZone {
  id: string;
  name: string;
  state: string;
  type: 'landslide' | 'flood' | 'rainfall';
  risk: 'critical' | 'high' | 'moderate' | 'low';
  coordinates: [number, number][];
  description: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  state: string;
  type: 'shelter' | 'hospital' | 'village' | 'bridge' | 'road' | 'report';
  lat: number;
  lng: number;
  description?: string;
}

// Representative hazard zones across Northeast India
export const hazardZones: HazardZone[] = [
  {
    id: 'zone-1',
    name: 'Kamrup & Guwahati Foothills',
    state: 'Assam',
    type: 'landslide',
    risk: 'high',
    coordinates: [
      [26.12, 91.68],
      [26.24, 91.75],
      [26.22, 91.95],
      [26.08, 91.88],
    ],
    description: 'Steep hill slopes and urban runoff zones with heightened landslide vulnerability',
  },
  {
    id: 'zone-2',
    name: 'Imphal Valley & Loktak Basin',
    state: 'Manipur',
    type: 'flood',
    risk: 'moderate',
    coordinates: [
      [24.72, 93.85],
      [24.95, 93.92],
      [24.92, 94.08],
      [24.68, 93.98],
    ],
    description: 'Low-lying basin areas prone to monsoon river swelling and flash floods',
  },
  {
    id: 'zone-3',
    name: 'East Khasi Hills & Sohra Ridge',
    state: 'Meghalaya',
    type: 'rainfall',
    risk: 'critical',
    coordinates: [
      [25.22, 91.65],
      [25.42, 91.70],
      [25.38, 91.98],
      [25.18, 91.92],
    ],
    description: 'World-record monsoon rainfall belt; active rockfall and slope subsidence zone',
  },
  {
    id: 'zone-4',
    name: 'Aizawl Mountain Ridge',
    state: 'Mizoram',
    type: 'landslide',
    risk: 'high',
    coordinates: [
      [23.68, 92.65],
      [23.82, 92.74],
      [23.78, 92.86],
      [23.60, 92.78],
    ],
    description: 'High-elevation shale ridge susceptible to mass-wasting during intense precipitation',
  },
  {
    id: 'zone-5',
    name: 'Teesta Valley & Mangan Slide Zone',
    state: 'Sikkim',
    type: 'landslide',
    risk: 'critical',
    coordinates: [
      [27.42, 88.48],
      [27.60, 88.58],
      [27.56, 88.75],
      [27.35, 88.62],
    ],
    description: 'Deep river gorge prone to catastrophic slope failure and debris flows',
  },
  {
    id: 'zone-6',
    name: 'Tawang - Kameng Escarpment',
    state: 'Arunachal Pradesh',
    type: 'landslide',
    risk: 'high',
    coordinates: [
      [27.52, 91.82],
      [27.70, 91.95],
      [27.65, 92.15],
      [27.45, 92.02],
    ],
    description: 'High alpine pass roads and steep moraine slopes subject to slip failures',
  },
  {
    id: 'zone-7',
    name: 'Kohima Bypass & Dzüdza Ridge',
    state: 'Nagaland',
    type: 'landslide',
    risk: 'high',
    coordinates: [
      [25.60, 94.05],
      [25.75, 94.14],
      [25.70, 94.28],
      [25.55, 94.18],
    ],
    description: 'NH-29 arterial transport corridor vulnerable to massive sinking zones',
  },
  {
    id: 'zone-8',
    name: 'Longtharai & Dhalai Hill Tracts',
    state: 'Tripura',
    type: 'flood',
    risk: 'moderate',
    coordinates: [
      [23.78, 91.85],
      [23.95, 91.92],
      [23.92, 92.05],
      [23.72, 91.98],
    ],
    description: 'Seasonal flash-flood prone valley connecting southern transport lines',
  },
];

// Points of interest across Northeast India
export const pointsOfInterest: PointOfInterest[] = [
  // Assam
  {
    id: 'shelter-1',
    name: 'Guwahati Multi-Purpose Relief Shelter',
    state: 'Assam',
    type: 'shelter',
    lat: 26.1445,
    lng: 91.7362,
    description: 'Capacity: 500 persons • Medical post & power backup',
  },
  {
    id: 'hospital-1',
    name: 'Gauhati Medical College & Hospital (GMCH)',
    state: 'Assam',
    type: 'hospital',
    lat: 26.1552,
    lng: 91.7755,
    description: 'Level 1 Trauma & 24/7 Emergency Center',
  },
  {
    id: 'bridge-1',
    name: 'Saraighat Brahmaputra Bridge',
    state: 'Assam',
    type: 'bridge',
    lat: 26.165,
    lng: 91.76,
    description: 'Vital rail & road transport lifeline across Brahmaputra',
  },
  {
    id: 'report-1',
    name: 'Guwahati Naranarayan Ghy Road Block',
    state: 'Assam',
    type: 'report',
    lat: 26.175,
    lng: 91.72,
    description: 'Minor earth collapse cleared, single lane active',
  },

  // Meghalaya
  {
    id: 'shelter-3',
    name: 'Shillong Polo Grounds Evacuation Center',
    state: 'Meghalaya',
    type: 'shelter',
    lat: 25.585,
    lng: 91.898,
    description: 'Capacity: 400 persons • Central supplies hub',
  },
  {
    id: 'hospital-2',
    name: 'NEIGRIHMS Super-Speciality Hospital',
    state: 'Meghalaya',
    type: 'hospital',
    lat: 25.5688,
    lng: 91.9333,
    description: 'Premier tertiary healthcare facility in NER',
  },
  {
    id: 'village-1',
    name: 'Mawlynnong Community Post',
    state: 'Meghalaya',
    type: 'village',
    lat: 25.201,
    lng: 91.916,
    description: 'Community early-warning sirens and muster point',
  },

  // Sikkim
  {
    id: 'shelter-4',
    name: 'Gangtok Khel Gaon Relief Base',
    state: 'Sikkim',
    type: 'shelter',
    lat: 27.338,
    lng: 88.612,
    description: 'Capacity: 350 persons • Stocked with cold weather gear',
  },
  {
    id: 'hospital-4',
    name: 'STNM Multi-Speciality Hospital',
    state: 'Sikkim',
    type: 'hospital',
    lat: 27.315,
    lng: 88.601,
    description: '24/7 Emergency response & blood bank',
  },

  // Arunachal Pradesh
  {
    id: 'shelter-5',
    name: 'Itanagar Indira Gandhi Park Shelter',
    state: 'Arunachal Pradesh',
    type: 'shelter',
    lat: 27.098,
    lng: 93.615,
    description: 'Capacity: 450 persons • Helipad accessible',
  },
  {
    id: 'hospital-5',
    name: 'TRIHMS Hospital Naharlagun',
    state: 'Arunachal Pradesh',
    type: 'hospital',
    lat: 27.105,
    lng: 93.695,
    description: 'State medical college & critical care unit',
  },

  // Nagaland
  {
    id: 'shelter-6',
    name: 'Kohima Local Ground Community Hub',
    state: 'Nagaland',
    type: 'shelter',
    lat: 25.674,
    lng: 94.108,
    description: 'Capacity: 300 persons • SDRF command outpost',
  },
  {
    id: 'hospital-6',
    name: 'Naga Hospital Authority Kohima',
    state: 'Nagaland',
    type: 'hospital',
    lat: 25.669,
    lng: 94.104,
    description: '24/7 Emergency care & trauma service',
  },

  // Manipur
  {
    id: 'shelter-2',
    name: 'Imphal Khuman Lampak Stadium Shelter',
    state: 'Manipur',
    type: 'shelter',
    lat: 24.817,
    lng: 94.9042,
    description: 'Capacity: 600 persons • Clean water storage',
  },
  {
    id: 'hospital-3',
    name: 'RIMS Hospital Imphal',
    state: 'Manipur',
    type: 'hospital',
    lat: 24.812,
    lng: 93.923,
    description: 'Regional Institute of Medical Sciences',
  },

  // Mizoram
  {
    id: 'shelter-7',
    name: 'Aizawl AR Ground Relief Depot',
    state: 'Mizoram',
    type: 'shelter',
    lat: 23.731,
    lng: 92.717,
    description: 'Capacity: 350 persons • Disaster response stash',
  },
  {
    id: 'hospital-7',
    name: 'Civil Hospital Aizawl',
    state: 'Mizoram',
    type: 'hospital',
    lat: 23.728,
    lng: 92.719,
    description: '24/7 Central trauma facility',
  },

  // Tripura
  {
    id: 'shelter-8',
    name: 'Agartala Vivekananda Stadium Camp',
    state: 'Tripura',
    type: 'shelter',
    lat: 23.835,
    lng: 91.282,
    description: 'Capacity: 500 persons • Flood response relief center',
  },
  {
    id: 'hospital-8',
    name: 'AGMC & GBP Hospital Agartala',
    state: 'Tripura',
    type: 'hospital',
    lat: 23.856,
    lng: 91.295,
    description: 'State referral hospital with 24/7 emergency unit',
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
  shelter: '#2563eb', // royal blue
  hospital: '#dc2626', // emergency red
  village: '#8b5cf6', // purple
  bridge: '#d97706', // amber
  road: '#059669', // emerald
  report: '#f97316', // orange
};

// NER Region definitions for quick navigation
export interface RegionOption {
  id: string;
  name: string;
  shortName: string;
  center: [number, number];
  zoom: number;
}

export const nerRegions: RegionOption[] = [
  { id: 'all', name: 'Entire Northeast India (Unified)', shortName: 'All NER', center: [26.15, 92.9], zoom: 7 },
  { id: 'assam', name: 'Assam (Guwahati, Brahmaputra)', shortName: 'Assam', center: [26.2, 92.8], zoom: 8 },
  { id: 'meghalaya', name: 'Meghalaya (Shillong, Sohra)', shortName: 'Meghalaya', center: [25.55, 91.6], zoom: 8 },
  { id: 'sikkim', name: 'Sikkim (Gangtok, Teesta Basin)', shortName: 'Sikkim', center: [27.45, 88.55], zoom: 9 },
  { id: 'arunachal', name: 'Arunachal Pradesh (Itanagar, Tawang)', shortName: 'Arunachal', center: [27.9, 94.6], zoom: 8 },
  { id: 'nagaland', name: 'Nagaland (Kohima, Dimapur)', shortName: 'Nagaland', center: [25.9, 94.3], zoom: 8 },
  { id: 'manipur', name: 'Manipur (Imphal, Loktak)', shortName: 'Manipur', center: [24.8, 93.9], zoom: 8 },
  { id: 'mizoram', name: 'Mizoram (Aizawl, Lunglei)', shortName: 'Mizoram', center: [23.3, 92.8], zoom: 8 },
  { id: 'tripura', name: 'Tripura (Agartala, Dhalai)', shortName: 'Tripura', center: [23.8, 91.8], zoom: 8 },
];
