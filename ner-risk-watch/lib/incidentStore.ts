import { EventEmitter } from 'events';

export interface Incident {
  id: string;
  referenceId: string;
  fullName: string;
  contactNumber: string;
  latitude: number;
  longitude: number;
  landmark: string;
  origin: string;
  needs: string[];
  urgency: 'critical' | 'urgent' | 'stable';
  adults: number;
  children: number;
  elderly: number;
  timestamp: number;
  status: 'PENDING_OFFLINE' | 'DISPATCHED' | 'EN_ROUTE' | 'RESOLVED';
  assignedUnit?: string;
  notes?: string;
  sector?: string;
}

export interface Advisory {
  id: string;
  title: string;
  sector: string;
  type: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  time: string;
  description: string;
  tags: string[];
}

// Initial realistic Northeast India disaster response seed data
const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'RPT-1740000101',
    referenceId: 'REQ-2026-NER-8092',
    fullName: 'Bhaben Kalita & Family',
    contactNumber: '+91 94350-18921',
    latitude: 26.1824,
    longitude: 91.7618,
    landmark: 'Near Bharalu River Embankment, Shantipur',
    origin: 'Guwahati, Kamrup Metro, Assam',
    needs: ['Evacuation', 'Medical Help', 'Stranded'],
    urgency: 'critical',
    adults: 3,
    children: 2,
    elderly: 1,
    timestamp: Date.now() - 1000 * 60 * 12, // 12 mins ago
    status: 'DISPATCHED',
    assignedUnit: 'NDRF 1st Bn (Patgaon Team B)',
    notes: 'Water level risen 1.2m above floor line. Inflatable boat deployed.',
    sector: 'SECTOR 2 - BRAHMAPUTRA BASIN',
  },
  {
    id: 'RPT-1740000202',
    referenceId: 'REQ-2026-NER-4115',
    fullName: 'Lalrinsanga Pachuau',
    contactNumber: '+91 98623-77402',
    latitude: 23.7271,
    longitude: 92.7176,
    landmark: 'Bawngkawn South Ridge Slope',
    origin: 'Aizawl, Mizoram',
    needs: ['Stranded', 'Power Outage'],
    urgency: 'urgent',
    adults: 2,
    children: 0,
    elderly: 0,
    timestamp: Date.now() - 1000 * 60 * 35,
    status: 'PENDING_OFFLINE',
    sector: 'SECTOR 5 - AIZAWL RIDGE',
  },
  {
    id: 'RPT-1740000303',
    referenceId: 'REQ-2026-NER-1923',
    fullName: 'Dr. Mary Lyngdoh',
    contactNumber: '+91 94361-05519',
    latitude: 25.5788,
    longitude: 91.8933,
    landmark: 'Mawkdok Bridge Bypass, Sohra Highway',
    origin: 'East Khasi Hills, Meghalaya',
    needs: ['Medical Help', 'Vulnerable Person'],
    urgency: 'critical',
    adults: 1,
    children: 0,
    elderly: 2,
    timestamp: Date.now() - 1000 * 60 * 52,
    status: 'EN_ROUTE',
    assignedUnit: 'SDRF Meghalaya QRT-4',
    notes: 'Elderly cardiac patient requiring oxygen cylinder transfer.',
    sector: 'SECTOR 4 - SOHRA ESCARPMENT',
  },
  {
    id: 'RPT-1740000404',
    referenceId: 'REQ-2026-NER-6701',
    fullName: 'Tenzing Bhutia',
    contactNumber: '+91 97330-88129',
    latitude: 27.3389,
    longitude: 88.6065,
    landmark: 'Tathangchen Upper Catchment',
    origin: 'Gangtok, East Sikkim',
    needs: ['Food / Water', 'Power Outage'],
    urgency: 'stable',
    adults: 4,
    children: 1,
    elderly: 1,
    timestamp: Date.now() - 1000 * 60 * 120,
    status: 'RESOLVED',
    assignedUnit: 'ITBP Sector 3 Relief Depot',
    notes: 'Clean drinking water and ration kits delivered successfully.',
    sector: 'SECTOR 8 - SIKKIM HIGHLANDS',
  },
];

const INITIAL_ADVISORIES: Advisory[] = [
  {
    id: 'ADV-LS-204',
    title: 'High Landslide Probability: NH-6 Sonapur Slopes',
    sector: 'SECTOR 4 - MEGHALAYA/ASSAM CORRIDOR',
    type: 'Soil Saturation Critical (94%)',
    level: 'critical',
    time: 'Valid until 23:00 IST · Continuous Telemetry',
    description: 'Saturation levels have exceeded safety thresholds. Predictive GIS slope stability model indicates imminent mudflow hazard.',
    tags: ['Precipitation Warning', 'GIS Model: Alpha-9', 'Traffic Halt'],
  },
  {
    id: 'ADV-RF-102',
    title: 'Flash Flood Surge: Kopili & Bharalu River Tributaries',
    sector: 'SECTOR 2 - KAMRUP & NAGAON',
    type: 'Hydrological Surge',
    level: 'high',
    time: 'Predicted Peak: 22:30 IST',
    description: 'Upstream reservoir discharge combined with 45mm/hr rain inflow. Secondary embankments under structural watch.',
    tags: ['Hydrology Alert', 'Evacuation Ready', 'SDRF Staged'],
  },
  {
    id: 'ADV-EQ-301',
    title: 'Zone V Seismic Telemetry Watch',
    sector: 'ALL SECTORS (NER REGIONAL CRATON)',
    type: 'Seismic Surveillance',
    level: 'low',
    time: 'Live Sentinel Stream',
    description: 'No anomalous micro-tremors detected in past 6 hours across Himalayan thrust faults. Regional telemetry nominal.',
    tags: ['Telemetry Nominal', 'USGS / IMD Feed'],
  },
];

class IncidentStoreManager {
  private incidents: Incident[] = [...INITIAL_INCIDENTS];
  private advisories: Advisory[] = [...INITIAL_ADVISORIES];
  public events = new EventEmitter();

  constructor() {
    this.events.setMaxListeners(100);
  }

  getIncidents(filter?: {
    status?: string;
    urgency?: string;
    sector?: string;
    search?: string;
  }): Incident[] {
    let result = [...this.incidents];

    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter(i => i.status === filter.status);
    }
    if (filter?.urgency && filter.urgency !== 'ALL') {
      result = result.filter(i => i.urgency === filter.urgency);
    }
    if (filter?.sector && filter.sector !== 'ALL') {
      result = result.filter(i => i.sector?.toLowerCase().includes(filter.sector!.toLowerCase()));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        i =>
          i.fullName.toLowerCase().includes(q) ||
          i.referenceId.toLowerCase().includes(q) ||
          i.landmark.toLowerCase().includes(q) ||
          i.origin.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => b.timestamp - a.timestamp);
  }

  getIncidentById(id: string): Incident | undefined {
    return this.incidents.find(i => i.id === id || i.referenceId === id);
  }

  addIncident(data: Partial<Incident>): Incident {
    const newIncident: Incident = {
      id: data.id || `RPT-${Date.now()}`,
      referenceId: data.referenceId || `REQ-2026-NER-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: data.fullName || 'Anonymous Citizen',
      contactNumber: data.contactNumber || 'Field Radio',
      latitude: Number(data.latitude) || 26.1445 + (Math.random() - 0.5) * 0.05,
      longitude: Number(data.longitude) || 91.7362 + (Math.random() - 0.5) * 0.05,
      landmark: data.landmark || 'GPS Field Coordinate Anchor',
      origin: data.origin || 'Northeast Emergency Sector',
      needs: data.needs || ['Emergency Rescue'],
      urgency: data.urgency || 'critical',
      adults: Number(data.adults) || 1,
      children: Number(data.children) || 0,
      elderly: Number(data.elderly) || 0,
      timestamp: data.timestamp || Date.now(),
      status:
        (data.status as any) === 'SYNCED' || !data.status
          ? 'PENDING_OFFLINE'
          : (data.status as Incident['status']),
      sector: data.sector || 'SECTOR 2 - BRAHMAPUTRA REGION',
    };

    // Remove existing if duplicate referenceId
    this.incidents = this.incidents.filter(i => i.referenceId !== newIncident.referenceId && i.id !== newIncident.id);
    this.incidents.unshift(newIncident);

    // Broadcast to real-time subscribers
    this.events.emit('INCIDENT_CREATED', newIncident);
    return newIncident;
  }

  updateIncidentStatus(
    id: string,
    status: Incident['status'],
    assignedUnit?: string,
    notes?: string
  ): Incident | null {
    const incident = this.incidents.find(i => i.id === id || i.referenceId === id);
    if (!incident) return null;

    incident.status = status;
    if (assignedUnit !== undefined) incident.assignedUnit = assignedUnit;
    if (notes !== undefined) incident.notes = notes;

    this.events.emit('INCIDENT_UPDATED', incident);
    return incident;
  }

  getAdvisories(): Advisory[] {
    return [...this.advisories];
  }

  addAdvisory(advisory: Advisory): Advisory {
    this.advisories.unshift(advisory);
    this.events.emit('ADVISORY_CREATED', advisory);
    return advisory;
  }

  getAnalytics() {
    const total = this.incidents.length;
    const critical = this.incidents.filter(i => i.urgency === 'critical' && i.status !== 'RESOLVED').length;
    const pending = this.incidents.filter(i => i.status === 'PENDING_OFFLINE').length;
    const dispatched = this.incidents.filter(i => i.status === 'DISPATCHED' || i.status === 'EN_ROUTE').length;
    const resolved = this.incidents.filter(i => i.status === 'RESOLVED').length;

    const totalVulnerable = this.incidents.reduce(
      (acc, curr) => acc + (curr.status !== 'RESOLVED' ? curr.elderly + curr.children : 0),
      0
    );

    const totalVictims = this.incidents.reduce(
      (acc, curr) => acc + (curr.status !== 'RESOLVED' ? curr.adults + curr.children + curr.elderly : 0),
      0
    );

    return {
      total,
      critical,
      pending,
      dispatched,
      resolved,
      totalVictims,
      totalVulnerable,
      activeUnitsCount: 14,
      avgDispatchTimeMinutes: 4.8,
      gridStatus: 'OPERATIONAL',
      satelliteTelemetry: 'LOCKED (NavIC / Sentinel-2)',
    };
  }
}

// Global singleton instance across HMR in development
const globalForStore = globalThis as unknown as { incidentStore?: IncidentStoreManager };
export const incidentStore = globalForStore.incidentStore || new IncidentStoreManager();
if (process.env.NODE_ENV !== 'production') globalForStore.incidentStore = incidentStore;
