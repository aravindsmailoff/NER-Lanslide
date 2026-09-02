// Digital Twin Hazard & Operational Overlay Data for Northeast India (NER 8 states)
// Compliant with Multi-Trigger AI Hazard Engine & Section 19 Shelter/Relief Architecture

export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low';
export type TrendDirection = 'increasing' | 'stable' | 'decreasing';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type OperationalStatus = 'open' | 'full' | 'closed' | 'unverified';
export type CorridorStatus = 'NORMAL' | 'AT RISK' | 'THREATENED' | 'BLOCKED' | 'VERIFIED BLOCKED';

export interface MultiTriggerMetrics {
  rainfall1h: number; // mm
  rainfall24h: number; // mm
  rainfall72h: number; // mm
  soilMoisturePct: number; // %
  slopeAngleDeg: number; // degrees
  riverStageMeters?: number; // meters above danger level
  poreWaterPressureKPa?: number;
}

export interface ExposedAssets {
  villagesCount: number;
  roadsCount: number;
  bridgesCount: number;
  criticalFacilities: string[];
}

export interface ForecastProjection {
  hours: number;
  risk: RiskLevel;
  triggerSummary: string;
}

export interface HazardZone {
  id: string;
  name: string;
  state: string;
  district: string;
  type: 'landslide' | 'flood' | 'rainfall' | 'compound';
  risk: RiskLevel;
  susceptibilityScore: number; // 0-100 (static terrain, geology, baseline)
  dynamicHazardScore: number; // 0-100 (current live triggers)
  trend: TrendDirection;
  confidence: ConfidenceLevel;
  contributingFactors: string[];
  multiTriggerMetrics: MultiTriggerMetrics;
  forecastRisk: ForecastProjection[];
  exposedAssets: ExposedAssets;
  computedAt: string;
  modelVersion: string;
  coordinates: [number, number][];
  description: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  state: string;
  district?: string;
  type: 'shelter' | 'hospital' | 'village' | 'bridge' | 'road' | 'report' | 'relief_camp';
  lat: number;
  lng: number;
  description?: string;
  operationalStatus?: OperationalStatus;
  capacity?: {
    current: number;
    max: number;
  };
  verifiedBy?: string;
  lastVerifiedAt?: string;
  isCompromisedByHazard?: boolean;
  distanceKm?: number;
  contactNumber?: string;
}

export interface RoadCorridor {
  id: string;
  name: string;
  highwayNumber: string;
  origin: string;
  destination: string;
  lengthKm: number;
  status: CorridorStatus;
  affectedZoneId?: string;
  chokePointName: string;
  chokePointCoords: [number, number];
  alternativeRouteName?: string;
  alternativeRouteBypass?: string;
  departmentResponsible: string;
  advisoryText: string;
  lastInspectionAt: string;
  coordinates: [number, number][];
}

export interface ActionChecklistItem {
  id: string;
  priority: 'immediate' | 'high' | 'recommended';
  text: string;
  category: 'evacuation' | 'kit' | 'communication' | 'home';
}

export interface ActionChecklist {
  riskLevel: RiskLevel;
  title: string;
  headline: string;
  color: string;
  items: ActionChecklistItem[];
}

// Representative hazard zones across all 8 NER States
export const hazardZones: HazardZone[] = [
  {
    id: 'zone-1',
    name: 'Kamrup Metro & Guwahati Foothills',
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    type: 'compound',
    risk: 'high',
    susceptibilityScore: 78,
    dynamicHazardScore: 84,
    trend: 'increasing',
    confidence: 'high',
    contributingFactors: [
      '72h cumulative rainfall: 185mm (exceeds 150mm baseline threshold)',
      'Artificial hill cutting along Naranarayan & Sarania ridges',
      'Urban drainage overflow backing into Bharalu basin',
      'High regolith saturation (86% soil moisture)',
    ],
    multiTriggerMetrics: {
      rainfall1h: 22,
      rainfall24h: 94,
      rainfall72h: 185,
      soilMoisturePct: 86,
      slopeAngleDeg: 34,
      riverStageMeters: 0.85,
    },
    forecastRisk: [
      { hours: 24, risk: 'high', triggerSummary: '+35mm rainfall expected; slope slip risk elevated' },
      { hours: 48, risk: 'critical', triggerSummary: 'Peak monsoon convergence zone; soil liquefaction threshold' },
      { hours: 72, risk: 'high', triggerSummary: 'Gradual easing with sustained waterlogged runoffs' },
    ],
    exposedAssets: {
      villagesCount: 7,
      roadsCount: 4,
      bridgesCount: 2,
      criticalFacilities: ['Guwahati Refinery link', 'Kahilipara Substation', 'Kamakhya bypass'],
    },
    computedAt: '2026-09-02T20:45:00+05:30',
    modelVersion: 'v2.4-NER-Twin',
    coordinates: [
      [26.12, 91.68],
      [26.24, 91.75],
      [26.22, 91.95],
      [26.08, 91.88],
    ],
    description: 'Steep hill slopes and urban runoff zones with heightened compound landslide & flash-flood vulnerability',
  },
  {
    id: 'zone-2',
    name: 'Imphal Valley & Loktak Basin',
    state: 'Manipur',
    district: 'Imphal West / Bishnupur',
    type: 'flood',
    risk: 'moderate',
    susceptibilityScore: 65,
    dynamicHazardScore: 62,
    trend: 'stable',
    confidence: 'medium',
    contributingFactors: [
      'Loktak lake peripheral spillway near holding capacity',
      'Nambul & Imphal river discharge at warning grade (+0.4m)',
      'Flat topography slowing natural discharge into Ningthee system',
    ],
    multiTriggerMetrics: {
      rainfall1h: 6,
      rainfall24h: 38,
      rainfall72h: 92,
      soilMoisturePct: 74,
      slopeAngleDeg: 12,
      riverStageMeters: 0.42,
    },
    forecastRisk: [
      { hours: 24, risk: 'moderate', triggerSummary: 'Steady water levels; periodic agricultural low-lying inundation' },
      { hours: 48, risk: 'moderate', triggerSummary: 'Controlled outflow via Ithai barrage' },
      { hours: 72, risk: 'low', triggerSummary: 'Decreasing rainfall band moving westward' },
    ],
    exposedAssets: {
      villagesCount: 14,
      roadsCount: 3,
      bridgesCount: 3,
      criticalFacilities: ['Bishnupur Market Road', 'Khangabok Community Health Centre'],
    },
    computedAt: '2026-09-02T20:30:00+05:30',
    modelVersion: 'v2.4-NER-Twin',
    coordinates: [
      [24.72, 93.85],
      [24.95, 93.92],
      [24.92, 94.08],
      [24.68, 93.98],
    ],
    description: 'Low-lying basin areas prone to monsoon river swelling and agricultural plain waterlogging',
  },
  {
    id: 'zone-3',
    name: 'East Khasi Hills & Sohra Ridge',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    type: 'landslide',
    risk: 'critical',
    susceptibilityScore: 92,
    dynamicHazardScore: 96,
    trend: 'increasing',
    confidence: 'high',
    contributingFactors: [
      'Extreme rainfall intensity: 310mm / 48h over fractured sandstone plateaus',
      'Shear stress on limestone escarpments along Shillong-Sohra road',
      'Active debris flow detected near Mawmluh and Wahkaba waterfalls',
      'Zero pore water dissipation capacity left in thin mountain soil',
    ],
    multiTriggerMetrics: {
      rainfall1h: 38,
      rainfall24h: 172,
      rainfall72h: 345,
      soilMoisturePct: 98,
      slopeAngleDeg: 46,
      riverStageMeters: 2.1,
    },
    forecastRisk: [
      { hours: 24, risk: 'critical', triggerSummary: 'Active rockfall hazard on NH-206; total road breach risk' },
      { hours: 48, risk: 'critical', triggerSummary: 'Continuous cloudburst warnings from IMD Mawsynram station' },
      { hours: 72, risk: 'high', triggerSummary: 'Rainfall easing but delayed pore pressure slide risk lingers' },
    ],
    exposedAssets: {
      villagesCount: 9,
      roadsCount: 5,
      bridgesCount: 4,
      criticalFacilities: ['Sohra Civil Hospital access route', 'Mawkdok bridge approach', 'Saimika power feeder'],
    },
    computedAt: '2026-09-02T20:50:00+05:30',
    modelVersion: 'v2.4-NER-Twin',
    coordinates: [
      [25.22, 91.65],
      [25.42, 91.70],
      [25.38, 91.98],
      [25.18, 91.92],
    ],
    description: 'World-record orographic rainfall belt; active rockfall, slope subsidence, and deep debris slips',
  },
  {
    id: 'zone-4',
    name: 'Aizawl Mountain Ridge',
    state: 'Mizoram',
    district: 'Aizawl',
    type: 'landslide',
    risk: 'high',
    susceptibilityScore: 88,
    dynamicHazardScore: 82,
    trend: 'increasing',
    confidence: 'high',
    contributingFactors: [
      'Tectonically sheared shale formations dipping parallel to urban slope face',
      'Unplanned building loadings along Durtlang and Hunthar valley scarps',
      '72h rainfall: 142mm saturating unconsolidated sub-surface layers',
    ],
    multiTriggerMetrics: {
      rainfall1h: 16,
      rainfall24h: 68,
      rainfall72h: 142,
      soilMoisturePct: 83,
      slopeAngleDeg: 39,
    },
    forecastRisk: [
      { hours: 24, risk: 'high', triggerSummary: 'Potential sinking at Hunthar Veng arterial link' },
      { hours: 48, risk: 'high', triggerSummary: 'Rainfall persistence keeping ground saturation high' },
      { hours: 72, risk: 'moderate', triggerSummary: 'Drainage recovery expected' },
    ],
    exposedAssets: {
      villagesCount: 6,
      roadsCount: 3,
      bridgesCount: 1,
      criticalFacilities: ['Hunthar National Highway section', 'Durtlang water reservoir line'],
    },
    computedAt: '2026-09-02T20:35:00+05:30',
    modelVersion: 'v2.4-NER-Twin',
    coordinates: [
      [23.68, 92.65],
      [23.82, 92.74],
      [23.78, 92.86],
      [23.60, 92.78],
    ],
    description: 'High-elevation shale ridge susceptible to mass-wasting and structural sinking during sustained downpours',
  },
  {
    id: 'zone-5',
    name: 'Teesta Valley & Mangan Slide Zone',
    state: 'Sikkim',
    district: 'Mangan / North Sikkim',
    type: 'compound',
    risk: 'critical',
    susceptibilityScore: 94,
    dynamicHazardScore: 95,
    trend: 'increasing',
    confidence: 'high',
    contributingFactors: [
      'Steep V-shaped Himalayan gorge with fractured gneiss bedrock',
      'Teesta river undercut eroding toe of NH-10 at multiple chainages',
      'Heavy glacial lake discharge pulse and torrential alpine downpour',
      'Recent historical catastrophic slips along Chungthang-Mangan axis',
    ],
    multiTriggerMetrics: {
      rainfall1h: 31,
      rainfall24h: 145,
      rainfall72h: 280,
      soilMoisturePct: 95,
      slopeAngleDeg: 49,
      riverStageMeters: 2.8,
    },
    forecastRisk: [
      { hours: 24, risk: 'critical', triggerSummary: 'NH-10 severing imminent at 29th Mile and Rangpo' },
      { hours: 48, risk: 'critical', triggerSummary: 'Debris flows blocking Teesta river channel' },
      { hours: 72, risk: 'high', triggerSummary: 'Gradual drawdown of mountain runoff' },
    ],
    exposedAssets: {
      villagesCount: 11,
      roadsCount: 6,
      bridgesCount: 5,
      criticalFacilities: ['Chungthang hydro intake', 'NH-10 Lifeline Corridor', 'Mangan District Hospital bypass'],
    },
    computedAt: '2026-09-02T20:55:00+05:30',
    modelVersion: 'v2.4-NER-Twin',
    coordinates: [
      [27.42, 88.48],
      [27.60, 88.58],
      [27.56, 88.75],
      [27.35, 88.62],
    ],
    description: 'Deep river gorge prone to catastrophic slope failure, toe-erosion, and debris flow roadblocks',
  },
  {
    id: 'zone-6',
    name: 'Tawang - Kameng Escarpment',
    state: 'Arunachal Pradesh',
    district: 'West Kameng / Tawang',
    type: 'landslide',
    risk: 'high',
    susceptibilityScore: 86,
    dynamicHazardScore: 80,
    trend: 'stable',
    confidence: 'medium',
    contributingFactors: [
      'High alpine freeze-thaw weathering loosening rock slopes',
      'Sela Tunnel approach road moraine slope movement',
      'Dense fog combined with continuous drizzle keeping scree wet',
    ],
    multiTriggerMetrics: {
      rainfall1h: 12,
      rainfall24h: 58,
      rainfall72h: 128,
      soilMoisturePct: 79,
      slopeAngleDeg: 42,
    },
    forecastRisk: [
      { hours: 24, risk: 'high', triggerSummary: 'Snowmelt and rain combination along Baisakhi pass' },
      { hours: 48, risk: 'moderate', triggerSummary: 'Cold front stabilizes moraine slopes' },
      { hours: 72, risk: 'moderate', triggerSummary: 'Single-lane movement manageable with BRO clearance' },
    ],
    exposedAssets: {
      villagesCount: 5,
      roadsCount: 2,
      bridgesCount: 2,
      criticalFacilities: ['Strategic Border Road (NH-13)', 'Dirang Civil Depot'],
    },
    computedAt: '2026-09-02T20:20:00+05:30',
    modelVersion: 'v2.4-NER-Twin',
    coordinates: [
      [27.52, 91.82],
      [27.70, 91.95],
      [27.65, 92.15],
      [27.45, 92.02],
    ],
    description: 'High alpine pass roads and steep moraine slopes subject to slip failures and rock falls',
  },
  {
    id: 'zone-7',
    name: 'Kohima Bypass & Dzüdza Ridge',
    state: 'Nagaland',
    district: 'Kohima',
    type: 'landslide',
    risk: 'high',
    susceptibilityScore: 85,
    dynamicHazardScore: 83,
    trend: 'increasing',
    confidence: 'high',
    contributingFactors: [
      'Dzüdza river bridge approach actively sinking (Disang shale formation)',
      'Vital NH-29 lifeline connecting Dimapur and Manipur border at risk',
      'Subsurface groundwater seepage lubricating slip planes',
    ],
    multiTriggerMetrics: {
      rainfall1h: 19,
      rainfall24h: 76,
      rainfall72h: 164,
      soilMoisturePct: 88,
      slopeAngleDeg: 36,
      riverStageMeters: 1.2,
    },
    forecastRisk: [
      { hours: 24, risk: 'high', triggerSummary: 'Dzüdza sinking zone displacement accelerating' },
      { hours: 48, risk: 'critical', triggerSummary: 'Total vehicular halt risk on NH-29; detour required via Niuland' },
      { hours: 72, risk: 'high', triggerSummary: 'SDRF earthmovers engaged for stabilizing toe' },
    ],
    exposedAssets: {
      villagesCount: 8,
      roadsCount: 3,
      bridgesCount: 1,
      criticalFacilities: ['NH-29 Dzüdza Bridge', 'Kohima Gas Supply corridor', 'Phesama evacuation depot'],
    },
    computedAt: '2026-09-02T20:40:00+05:30',
    modelVersion: 'v2.4-NER-Twin',
    coordinates: [
      [25.60, 94.05],
      [25.75, 94.14],
      [25.70, 94.28],
      [25.55, 94.18],
    ],
    description: 'NH-29 arterial transport corridor vulnerable to massive sinking zones and mud avalanches',
  },
  {
    id: 'zone-8',
    name: 'Longtharai & Dhalai Hill Tracts',
    state: 'Tripura',
    district: 'Dhalai',
    type: 'flood',
    risk: 'moderate',
    susceptibilityScore: 68,
    dynamicHazardScore: 65,
    trend: 'decreasing',
    confidence: 'medium',
    contributingFactors: [
      'Dhalai & Manu river levels at 0.3m below red mark',
      'Flash inundation of bridge culverts along Ambassa corridor',
      'Silt accumulation in valley drainage canals',
    ],
    multiTriggerMetrics: {
      rainfall1h: 8,
      rainfall24h: 42,
      rainfall72h: 88,
      soilMoisturePct: 75,
      slopeAngleDeg: 18,
      riverStageMeters: 0.35,
    },
    forecastRisk: [
      { hours: 24, risk: 'moderate', triggerSummary: 'Low-lying floodings receding slowly' },
      { hours: 48, risk: 'low', triggerSummary: 'Fair weather window projected' },
      { hours: 72, risk: 'low', triggerSummary: 'Normal stream velocity restored' },
    ],
    exposedAssets: {
      villagesCount: 12,
      roadsCount: 4,
      bridgesCount: 2,
      criticalFacilities: ['Ambassa railway culvert', 'Kulai Community Health Center'],
    },
    computedAt: '2026-09-02T20:15:00+05:30',
    modelVersion: 'v2.4-NER-Twin',
    coordinates: [
      [23.78, 91.85],
      [23.95, 91.92],
      [23.92, 92.05],
      [23.72, 91.98],
    ],
    description: 'Seasonal flash-flood prone valley connecting southern Tripura transport lines',
  },
];

// Points of interest across Northeast India with Section 19 Shelter & Relief status
export const pointsOfInterest: PointOfInterest[] = [
  // Assam
  {
    id: 'shelter-1',
    name: 'Guwahati Multi-Purpose Relief Shelter',
    state: 'Assam',
    district: 'Kamrup Metro',
    type: 'shelter',
    lat: 26.1445,
    lng: 91.7362,
    description: 'Reinforced concrete structure • Solar microgrid & RO water plant',
    operationalStatus: 'open',
    capacity: { current: 180, max: 500 },
    verifiedBy: 'ASDMA Kamrup Desk',
    lastVerifiedAt: '2026-09-02T19:30:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 4.2,
    contactNumber: '0361-2733052',
  },
  {
    id: 'hospital-1',
    name: 'Gauhati Medical College & Hospital (GMCH)',
    state: 'Assam',
    district: 'Kamrup Metro',
    type: 'hospital',
    lat: 26.1552,
    lng: 91.7755,
    description: 'Level 1 Trauma & 24/7 Disaster Emergency Response Ward',
    operationalStatus: 'open',
    capacity: { current: 890, max: 1200 },
    verifiedBy: 'Health & Family Welfare Dept, Assam',
    lastVerifiedAt: '2026-09-02T20:00:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 2.1,
    contactNumber: '0361-2529457',
  },
  {
    id: 'relief-camp-1',
    name: 'Sarusajai Stadium Central Relief Logistics Camp',
    state: 'Assam',
    district: 'Kamrup Metro',
    type: 'relief_camp',
    lat: 26.118,
    lng: 91.765,
    description: 'SDRF food packet distribution, dry ration warehouse & muster center',
    operationalStatus: 'open',
    capacity: { current: 420, max: 1500 },
    verifiedBy: 'SDRF 1st Bn',
    lastVerifiedAt: '2026-09-02T20:10:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 5.6,
    contactNumber: '0361-2134567',
  },
  {
    id: 'bridge-1',
    name: 'Saraighat Brahmaputra Bridge',
    state: 'Assam',
    district: 'Kamrup',
    type: 'bridge',
    lat: 26.165,
    lng: 91.76,
    description: 'Vital rail & road transport lifeline across Brahmaputra. Water clearance: 3.4m',
    operationalStatus: 'open',
    verifiedBy: 'PWD Assam (NH Wing)',
    lastVerifiedAt: '2026-09-02T19:00:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 8.9,
  },
  {
    id: 'report-1',
    name: 'Naranarayan Hill Road Blockage',
    state: 'Assam',
    district: 'Kamrup Metro',
    type: 'report',
    lat: 26.175,
    lng: 91.72,
    description: 'Mud & rock slip blocking west-bound lane. Earthmover on site.',
    operationalStatus: 'closed',
    verifiedBy: 'Guwahati Traffic Police',
    lastVerifiedAt: '2026-09-02T20:25:00+05:30',
    isCompromisedByHazard: true,
    distanceKm: 3.5,
  },

  // Meghalaya
  {
    id: 'shelter-3',
    name: 'Shillong Polo Grounds Evacuation Center',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    type: 'shelter',
    lat: 25.585,
    lng: 91.898,
    description: 'Indoor stadium safe shelter with emergency bedding & generator',
    operationalStatus: 'open',
    capacity: { current: 120, max: 400 },
    verifiedBy: 'DDMA East Khasi Hills',
    lastVerifiedAt: '2026-09-02T19:45:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 3.8,
    contactNumber: '0364-2224089',
  },
  {
    id: 'shelter-3-sohra',
    name: 'Sohra Community Hall Temporary Shelter',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    type: 'shelter',
    lat: 25.295,
    lng: 91.72,
    description: 'Located in active landslide corridor - Caution advised',
    operationalStatus: 'unverified',
    capacity: { current: 140, max: 150 },
    verifiedBy: 'Local Village Council (Awaiting SDMA confirmation)',
    lastVerifiedAt: '2026-09-02T15:00:00+05:30',
    isCompromisedByHazard: true, // Inside Zone 3
    distanceKm: 32.0,
    contactNumber: '0364-2330111',
  },
  {
    id: 'hospital-2',
    name: 'NEIGRIHMS Super-Speciality Hospital',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    type: 'hospital',
    lat: 25.5688,
    lng: 91.9333,
    description: 'Premier tertiary healthcare facility with helipad and trauma unit',
    operationalStatus: 'open',
    capacity: { current: 480, max: 600 },
    verifiedBy: 'Directorate of Health Services Meghalaya',
    lastVerifiedAt: '2026-09-02T20:15:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 6.2,
    contactNumber: '0364-2538025',
  },
  {
    id: 'relief-camp-2',
    name: 'Mawphlang Community Distribution Point',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    type: 'relief_camp',
    lat: 25.46,
    lng: 91.76,
    description: 'Drinking water tankers, emergency milk & baby food store',
    operationalStatus: 'open',
    capacity: { current: 95, max: 300 },
    verifiedBy: 'Meghalaya State Relief Commission',
    lastVerifiedAt: '2026-09-02T18:30:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 21.4,
  },
  {
    id: 'village-1',
    name: 'Mawlynnong Community Safe Post',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    type: 'village',
    lat: 25.201,
    lng: 91.916,
    description: 'Community early-warning siren and village high-ground muster point',
    operationalStatus: 'open',
    verifiedBy: 'Village Council',
    lastVerifiedAt: '2026-09-02T17:30:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 48.0,
  },

  // Sikkim
  {
    id: 'shelter-4',
    name: 'Gangtok Khel Gaon Relief Base',
    state: 'Sikkim',
    district: 'East Sikkim',
    type: 'shelter',
    lat: 27.338,
    lng: 88.612,
    description: 'Stocked with thermal blankets, high-calorie ration & cold weather shelter',
    operationalStatus: 'open',
    capacity: { current: 110, max: 350 },
    verifiedBy: 'Sikkim SDMA',
    lastVerifiedAt: '2026-09-02T19:50:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 4.5,
    contactNumber: '03592-202461',
  },
  {
    id: 'hospital-4',
    name: 'STNM Multi-Speciality Hospital',
    state: 'Sikkim',
    district: 'East Sikkim',
    type: 'hospital',
    lat: 27.315,
    lng: 88.601,
    description: '24/7 State Emergency and Blood Bank • Level 1 Alpine Trauma care',
    operationalStatus: 'open',
    capacity: { current: 390, max: 550 },
    verifiedBy: 'Health Dept Sikkim',
    lastVerifiedAt: '2026-09-02T20:20:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 2.8,
    contactNumber: '03592-202944',
  },
  {
    id: 'shelter-4-mangan',
    name: 'Mangan Secondary School Relief Point',
    state: 'Sikkim',
    district: 'Mangan',
    type: 'shelter',
    lat: 27.51,
    lng: 88.54,
    description: 'Inside active Teesta gorge hazard perimeter! Access severed by slip.',
    operationalStatus: 'closed',
    capacity: { current: 0, max: 200 },
    verifiedBy: 'District Magistrate Mangan',
    lastVerifiedAt: '2026-09-02T18:00:00+05:30',
    isCompromisedByHazard: true, // Inside Zone 5
    distanceKm: 46.0,
  },

  // Arunachal Pradesh
  {
    id: 'shelter-5',
    name: 'Itanagar IG Park Disaster Relief Shelter',
    state: 'Arunachal Pradesh',
    district: 'Papum Pare',
    type: 'shelter',
    lat: 27.098,
    lng: 93.615,
    description: 'Capacity 450 persons • Helipad accessible for air-evacuation',
    operationalStatus: 'open',
    capacity: { current: 75, max: 450 },
    verifiedBy: 'DDMA Papum Pare',
    lastVerifiedAt: '2026-09-02T19:15:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 5.0,
    contactNumber: '0360-2212374',
  },
  {
    id: 'hospital-5',
    name: 'TRIHMS Hospital Naharlagun',
    state: 'Arunachal Pradesh',
    district: 'Papum Pare',
    type: 'hospital',
    lat: 27.105,
    lng: 93.695,
    description: 'State medical college & critical trauma surgery unit',
    operationalStatus: 'open',
    capacity: { current: 310, max: 420 },
    verifiedBy: 'Directorate of Health Services AP',
    lastVerifiedAt: '2026-09-02T20:05:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 12.0,
    contactNumber: '0360-2244248',
  },

  // Nagaland
  {
    id: 'shelter-6',
    name: 'Kohima Local Ground Community Hub',
    state: 'Nagaland',
    district: 'Kohima',
    type: 'shelter',
    lat: 25.674,
    lng: 94.108,
    description: 'SDRF command outpost, medical triage & satellite communication center',
    operationalStatus: 'open',
    capacity: { current: 90, max: 300 },
    verifiedBy: 'NSDMA Kohima',
    lastVerifiedAt: '2026-09-02T19:35:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 3.1,
    contactNumber: '0370-2291122',
  },
  {
    id: 'hospital-6',
    name: 'Naga Hospital Authority Kohima',
    state: 'Nagaland',
    district: 'Kohima',
    type: 'hospital',
    lat: 25.669,
    lng: 94.104,
    description: '24/7 Emergency and Trauma Services with backup oxygen & power generation',
    operationalStatus: 'open',
    capacity: { current: 215, max: 300 },
    verifiedBy: 'Health Dept Nagaland',
    lastVerifiedAt: '2026-09-02T20:10:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 2.7,
    contactNumber: '0370-2244248',
  },

  // Manipur
  {
    id: 'shelter-2',
    name: 'Imphal Khuman Lampak Stadium Shelter',
    state: 'Manipur',
    district: 'Imphal East',
    type: 'shelter',
    lat: 24.817,
    lng: 94.9042,
    description: 'High-elevation stadium compound safe from valley waterlogging',
    operationalStatus: 'open',
    capacity: { current: 160, max: 600 },
    verifiedBy: 'Manipur Relief & Disaster Dept',
    lastVerifiedAt: '2026-09-02T18:45:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 4.8,
    contactNumber: '0385-2458123',
  },
  {
    id: 'hospital-3',
    name: 'RIMS Hospital Imphal',
    state: 'Manipur',
    district: 'Imphal West',
    type: 'hospital',
    lat: 24.812,
    lng: 93.923,
    description: 'Regional Institute of Medical Sciences • 24/7 Emergency wing',
    operationalStatus: 'open',
    capacity: { current: 720, max: 950 },
    verifiedBy: 'RIMS Authority',
    lastVerifiedAt: '2026-09-02T20:15:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 3.5,
    contactNumber: '0385-2414750',
  },

  // Mizoram
  {
    id: 'shelter-7',
    name: 'Aizawl AR Ground Relief Depot',
    state: 'Mizoram',
    district: 'Aizawl',
    type: 'shelter',
    lat: 23.731,
    lng: 92.717,
    description: 'Stable bedrock staging area • Relief tents and emergency rations',
    operationalStatus: 'open',
    capacity: { current: 140, max: 350 },
    verifiedBy: 'Disaster Management & Rehabilitation Dept Mizoram',
    lastVerifiedAt: '2026-09-02T19:25:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 1.8,
    contactNumber: '0389-2334861',
  },
  {
    id: 'hospital-7',
    name: 'Civil Hospital Aizawl',
    state: 'Mizoram',
    district: 'Aizawl',
    type: 'hospital',
    lat: 23.728,
    lng: 92.719,
    description: '24/7 Central trauma facility and mobile ambulance dispatch hub',
    operationalStatus: 'open',
    capacity: { current: 280, max: 350 },
    verifiedBy: 'H&FW Mizoram',
    lastVerifiedAt: '2026-09-02T20:20:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 1.5,
    contactNumber: '0389-2322318',
  },

  // Tripura
  {
    id: 'shelter-8',
    name: 'Agartala Vivekananda Stadium Camp',
    state: 'Tripura',
    district: 'West Tripura',
    type: 'shelter',
    lat: 23.835,
    lng: 91.282,
    description: 'Flood relief shelter with water treatment plant and community kitchen',
    operationalStatus: 'open',
    capacity: { current: 195, max: 500 },
    verifiedBy: 'Tripura SDMA',
    lastVerifiedAt: '2026-09-02T19:40:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 2.2,
    contactNumber: '0381-2415385',
  },
  {
    id: 'hospital-8',
    name: 'AGMC & GBP Hospital Agartala',
    state: 'Tripura',
    district: 'West Tripura',
    type: 'hospital',
    lat: 23.856,
    lng: 91.295,
    description: 'State apex hospital • 24/7 Emergency and Trauma Services',
    operationalStatus: 'open',
    capacity: { current: 610, max: 800 },
    verifiedBy: 'Health Directorate Tripura',
    lastVerifiedAt: '2026-09-02T20:00:00+05:30',
    isCompromisedByHazard: false,
    distanceKm: 4.6,
    contactNumber: '0381-2356701',
  },
];

// Strategic Arterial Corridors across NER with live connectivity status
export const roadCorridors: RoadCorridor[] = [
  {
    id: 'corridor-1',
    name: 'Guwahati - Shillong Corridor (GS Road)',
    highwayNumber: 'NH-6',
    origin: 'Guwahati (Assam)',
    destination: 'Shillong (Meghalaya)',
    lengthKm: 98,
    status: 'AT RISK',
    affectedZoneId: 'zone-3',
    chokePointName: 'Umiam Lake approach & Byrnihat cuttings',
    chokePointCoords: [25.65, 91.90],
    alternativeRouteName: 'Nongpoh - Umsning Old State Road',
    alternativeRouteBypass: 'Take Old Umsning bypass to avoid heavy vehicle bottlenecks; light motor vehicles only',
    departmentResponsible: 'NHAI / Meghalaya PWD',
    advisoryText: 'Intermittent loose boulders near Umsning. Drive under 40 km/h; avoid night transit during active rainfall.',
    lastInspectionAt: '2026-09-02T19:30:00+05:30',
    coordinates: [
      [26.15, 91.75],
      [25.90, 91.88],
      [25.75, 91.89],
      [25.58, 91.89],
    ],
  },
  {
    id: 'corridor-2',
    name: 'Siliguri - Gangtok Lifeline',
    highwayNumber: 'NH-10',
    origin: 'Siliguri (West Bengal)',
    destination: 'Gangtok (Sikkim)',
    lengthKm: 114,
    status: 'BLOCKED',
    affectedZoneId: 'zone-5',
    chokePointName: '29th Mile & Bhalu Khola debris slide',
    chokePointCoords: [27.05, 88.45],
    alternativeRouteName: 'Lava - Gorubathan - Rangpo Route',
    alternativeRouteBypass: 'Reroute via Gorubathan -> Lava -> Damdim -> Rangpo border checkpost. +3.5 hours travel time.',
    departmentResponsible: 'BRO Project Swastik / PWD Sikkim',
    advisoryText: 'CRITICAL: Severe road breach at 29th Mile due to Teesta river scouring. NH-10 closed for all vehicular traffic.',
    lastInspectionAt: '2026-09-02T20:15:00+05:30',
    coordinates: [
      [26.72, 88.42],
      [26.92, 88.48],
      [27.18, 88.52],
      [27.33, 88.61],
    ],
  },
  {
    id: 'corridor-3',
    name: 'Dimapur - Kohima - Imphal Highway',
    highwayNumber: 'NH-29',
    origin: 'Dimapur (Nagaland)',
    destination: 'Kohima (Nagaland)',
    lengthKm: 74,
    status: 'THREATENED',
    affectedZoneId: 'zone-7',
    chokePointName: 'Dzüdza River Bridge sinking zone (Km 42)',
    chokePointCoords: [25.68, 94.04],
    alternativeRouteName: 'Niuland - Kohima Foothill Road',
    alternativeRouteBypass: 'Heavy commercial trucks diverted via Niuland -> Ghaspani -> Peducha rural road.',
    departmentResponsible: 'NHIDCL / Nagaland PWD',
    advisoryText: 'Single lane controlled movement for passenger vehicles. Subsurface subsidence monitored hourly with tilt sensors.',
    lastInspectionAt: '2026-09-02T19:55:00+05:30',
    coordinates: [
      [25.90, 93.73],
      [25.78, 93.89],
      [25.68, 94.04],
      [25.67, 94.10],
    ],
  },
  {
    id: 'corridor-4',
    name: 'Shillong - Jowai - Silchar Lifeline',
    highwayNumber: 'NH-6',
    origin: 'Shillong (Meghalaya)',
    destination: 'Silchar (Assam / Barak Valley)',
    lengthKm: 215,
    status: 'THREATENED',
    affectedZoneId: 'zone-3',
    chokePointName: 'Sonapur Tunnel mudflow bypass',
    chokePointCoords: [25.12, 92.36],
    alternativeRouteName: 'Guwahati - Lumding - Haflong Rail Route',
    alternativeRouteBypass: 'Essential petroleum & food convoy routed via Dima Hasao (NH-27) or Broad Gauge rail freight.',
    departmentResponsible: 'NHAI / BRO Project Pushpak',
    advisoryText: 'Heavy mud accumulation at southern mouth of Sonapur tunnel. Dozer clearing active. 2-hour queue delays.',
    lastInspectionAt: '2026-09-02T19:10:00+05:30',
    coordinates: [
      [25.58, 91.89],
      [25.44, 92.20],
      [25.12, 92.36],
      [24.82, 92.80],
    ],
  },
  {
    id: 'corridor-5',
    name: 'Silchar - Aizawl Highway',
    highwayNumber: 'NH-54',
    origin: 'Silchar (Assam)',
    destination: 'Aizawl (Mizoram)',
    lengthKm: 172,
    status: 'AT RISK',
    affectedZoneId: 'zone-4',
    chokePointName: 'Hunthar Veng scarp & Kawnpui slide zone',
    chokePointCoords: [23.82, 92.70],
    alternativeRouteName: 'Bairabi - Kolasib State Highway',
    alternativeRouteBypass: 'Light motor vehicles can divert via Bairabi railway bridge link to circumvent Kawnpui slide.',
    departmentResponsible: 'Mizoram PWD / NHIDCL',
    advisoryText: 'Slow movement near Hunthar Veng due to fresh subsidence crack. Watch for signalmen flags.',
    lastInspectionAt: '2026-09-02T18:45:00+05:30',
    coordinates: [
      [24.82, 92.80],
      [24.23, 92.68],
      [23.95, 92.67],
      [23.73, 92.71],
    ],
  },
  {
    id: 'corridor-6',
    name: 'Bhalukpong - Bomdila - Tawang Road',
    highwayNumber: 'NH-13',
    origin: 'Bhalukpong (Arunachal Pradesh)',
    destination: 'Tawang (Arunachal Pradesh)',
    lengthKm: 280,
    status: 'AT RISK',
    affectedZoneId: 'zone-6',
    chokePointName: 'Sange - Baisakhi scree slopes',
    chokePointCoords: [27.50, 92.10],
    alternativeRouteName: 'Balemu - Kalaktang Corridor',
    alternativeRouteBypass: 'Vehicles from Assam can enter via Kalaktang route which bypasses lower landslide prone gorges.',
    departmentResponsible: 'BRO Project Vartak',
    advisoryText: 'Sela Tunnel is fully functional, but open approaches have recurring rockfall in morning drizzle.',
    lastInspectionAt: '2026-09-02T18:00:00+05:30',
    coordinates: [
      [27.01, 92.65],
      [27.26, 92.42],
      [27.50, 92.10],
      [27.58, 91.86],
    ],
  },
];

// Authoritative Emergency Action Checklists (SDMA standard templates matched to risk state)
export const actionChecklists: Record<RiskLevel, ActionChecklist> = {
  critical: {
    riskLevel: 'critical',
    title: 'CRITICAL EMERGENCY PROTOCOL (RED ALERT)',
    headline: 'Imminent slope failure or flash flooding detected in your zone. Take immediate protective action.',
    color: '#dc2626',
    items: [
      {
        id: 'c-1',
        priority: 'immediate',
        category: 'evacuation',
        text: 'Evacuate immediately to designated high-ground safe shelter or community muster point.',
      },
      {
        id: 'c-2',
        priority: 'immediate',
        category: 'evacuation',
        text: 'Do NOT attempt to drive through flooded roads, bridge approaches, or active mountain cuttings.',
      },
      {
        id: 'c-3',
        priority: 'immediate',
        category: 'kit',
        text: 'Grab waterproof emergency "Go-Bag" (Aadhaar/ID, medications, battery torch, 48h emergency ration).',
      },
      {
        id: 'c-4',
        priority: 'high',
        category: 'home',
        text: 'Switch off main electrical breakers and LPG gas cylinders before stepping out.',
      },
      {
        id: 'c-5',
        priority: 'high',
        category: 'communication',
        text: 'Call 112 (National Disaster Line) or 1070 (State Emergency Center) if someone is trapped or immobilized.',
      },
    ],
  },
  high: {
    riskLevel: 'high',
    title: 'HIGH HAZARD ADVISORY (ORANGE WARNING)',
    headline: 'Severe slope saturation and rapid runoff underway. Evacuation readiness advised.',
    color: '#ea580c',
    items: [
      {
        id: 'h-1',
        priority: 'high',
        category: 'kit',
        text: 'Prepare emergency essentials: charge mobile phones, power banks, and ensure drinking water storage.',
      },
      {
        id: 'h-2',
        priority: 'high',
        category: 'evacuation',
        text: 'Identify the nearest verified shelter and confirm the safe route bypassing landslide polygons.',
      },
      {
        id: 'h-3',
        priority: 'high',
        category: 'home',
        text: 'Inspect your property for early warning signs: ground tension cracks, tilting trees, muddy seepages.',
      },
      {
        id: 'h-4',
        priority: 'recommended',
        category: 'communication',
        text: 'Inform family members outside the zone of your location and designated muster center.',
      },
      {
        id: 'h-5',
        priority: 'recommended',
        category: 'evacuation',
        text: 'Avoid non-essential highway transit; check road corridor status before departing.',
      },
    ],
  },
  moderate: {
    riskLevel: 'moderate',
    title: 'HAZARD WATCH ADVISORY (YELLOW WATCH)',
    headline: 'Elevated precipitation and soil moisture. Exercise caution in hilly or low-lying terrains.',
    color: '#eab308',
    items: [
      {
        id: 'm-1',
        priority: 'high',
        category: 'home',
        text: 'Keep domestic roof and slope runoff drains clear of mud, branches, and plastic blockage.',
      },
      {
        id: 'm-2',
        priority: 'recommended',
        category: 'communication',
        text: 'Monitor real-time IMD weather radar updates and local District Disaster Management advisories.',
      },
      {
        id: 'm-3',
        priority: 'recommended',
        category: 'evacuation',
        text: 'Avoid parking vehicles directly beneath steep unreinforced hill cuts or loose rockfaces.',
      },
      {
        id: 'm-4',
        priority: 'recommended',
        category: 'kit',
        text: 'Stock up on 3 days of non-perishable food items and essential prescription medicines.',
      },
    ],
  },
  low: {
    riskLevel: 'low',
    title: 'NORMAL MONSOON SURVEILLANCE (GREEN STATE)',
    headline: 'Dynamic risk is currently low. Normal precautionary measures apply.',
    color: '#22c55e',
    items: [
      {
        id: 'l-1',
        priority: 'recommended',
        category: 'home',
        text: 'Practice standard monsoon preparedness: inspect slope retainers and retain vegetative cover.',
      },
      {
        id: 'l-2',
        priority: 'recommended',
        category: 'communication',
        text: 'Keep emergency contact numbers for local police station and District Disaster Management handy.',
      },
      {
        id: 'l-3',
        priority: 'recommended',
        category: 'kit',
        text: 'Report newly observed slope cracks or drain collapses using the citizen incident reporting tool.',
      },
    ],
  },
};

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
  relief_camp: '#0284c7', // sky blue
  village: '#8b5cf6', // purple
  bridge: '#d97706', // amber
  road: '#059669', // emerald
  report: '#f97316', // orange
};

// Corridor status colors
export const corridorStatusColors: Record<CorridorStatus, string> = {
  'NORMAL': '#10b981', // green
  'AT RISK': '#f59e0b', // amber
  'THREATENED': '#f97316', // orange
  'BLOCKED': '#ef4444', // red
  'VERIFIED BLOCKED': '#b91c1c', // dark red
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

// Helper to determine data freshness state
export function getDataFreshness(isoString: string): {
  status: 'LIVE' | 'RECENT' | 'STALE';
  minutesAgo: number;
  label: string;
} {
  const parsed = new Date(isoString).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(0, Math.floor((now - parsed) / (1000 * 60)));

  if (diffMinutes < 30) {
    return { status: 'LIVE', minutesAgo: diffMinutes, label: `${diffMinutes}m ago (Live Telemetry)` };
  } else if (diffMinutes < 180) {
    return { status: 'RECENT', minutesAgo: diffMinutes, label: `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m ago` };
  } else {
    return { status: 'STALE', minutesAgo: diffMinutes, label: `Stale (${Math.floor(diffMinutes / 60)}h ago - sync required)` };
  }
}
