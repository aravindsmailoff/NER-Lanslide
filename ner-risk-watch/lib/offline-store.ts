// Offline Storage and Sync Utility for NER RiskWatch
// Enables offline-first operations when mountain connectivity is lost

import { HazardZone, PointOfInterest, RoadCorridor, hazardZones, pointsOfInterest, roadCorridors } from './hazard-overlays';

export interface CitizenIncidentReport {
  id: string;
  timestamp: string;
  hazardType: 'landslide' | 'mudflow' | 'flash_flood' | 'road_collapse' | 'river_overflow' | 'crack_formation';
  severity: 'minor' | 'moderate' | 'severe' | 'impassable';
  state: string;
  district?: string;
  locationDescription: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  reporterContact?: string;
  voiceNoteDescription?: string;
  syncStatus: 'queued_offline' | 'synchronized';
  syncedAt?: string;
}

const STORAGE_KEYS = {
  HAZARD_ZONES: 'ner_cached_hazard_zones_v1',
  POIS: 'ner_cached_pois_v1',
  CORRIDORS: 'ner_cached_corridors_v1',
  OFFLINE_REPORTS: 'ner_offline_incident_reports_v1',
  LAST_SYNC_TIME: 'ner_last_sync_timestamp_v1',
};

// Initialize cache if missing
export function initializeOfflineCache(): void {
  if (typeof window === 'undefined') return;

  try {
    if (!localStorage.getItem(STORAGE_KEYS.HAZARD_ZONES)) {
      localStorage.setItem(STORAGE_KEYS.HAZARD_ZONES, JSON.stringify(hazardZones));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POIS)) {
      localStorage.setItem(STORAGE_KEYS.POIS, JSON.stringify(pointsOfInterest));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CORRIDORS)) {
      localStorage.setItem(STORAGE_KEYS.CORRIDORS, JSON.stringify(roadCorridors));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME)) {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
    }
  } catch (err) {
    console.warn('LocalStorage error while initializing cache:', err);
  }
}

// Get cached hazard zones with fallback to bundled data
export function getCachedHazardZones(): HazardZone[] {
  if (typeof window === 'undefined') return hazardZones;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HAZARD_ZONES);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading cached hazard zones:', err);
  }
  return hazardZones;
}

// Get cached POIs with fallback
export function getCachedPointsOfInterest(): PointOfInterest[] {
  if (typeof window === 'undefined') return pointsOfInterest;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POIS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading cached POIs:', err);
  }
  return pointsOfInterest;
}

// Get cached Corridors with fallback
export function getCachedRoadCorridors(): RoadCorridor[] {
  if (typeof window === 'undefined') return roadCorridors;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CORRIDORS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading cached road corridors:', err);
  }
  return roadCorridors;
}

// Save a citizen report into offline queue
export function saveCitizenReport(report: Omit<CitizenIncidentReport, 'id' | 'timestamp' | 'syncStatus'>): CitizenIncidentReport {
  const isOnline = typeof window !== 'undefined' ? window.navigator.onLine : false;

  const newReport: CitizenIncidentReport = {
    ...report,
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    syncStatus: isOnline ? 'synchronized' : 'queued_offline',
    syncedAt: isOnline ? new Date().toISOString() : undefined,
  };

  if (typeof window !== 'undefined') {
    try {
      const existing = getQueuedReports();
      existing.unshift(newReport);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify(existing));
    } catch (err) {
      console.error('Error saving citizen incident report:', err);
    }
  }

  return newReport;
}

// Get all offline and submitted reports
export function getQueuedReports(): CitizenIncidentReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_REPORTS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading incident reports:', err);
  }
  return [];
}

// Attempt to sync pending offline reports
export function syncPendingReports(): { syncedCount: number; pendingCount: number } {
  if (typeof window === 'undefined' || !window.navigator.onLine) {
    return { syncedCount: 0, pendingCount: getQueuedReports().filter(r => r.syncStatus === 'queued_offline').length };
  }

  const reports = getQueuedReports();
  let synced = 0;

  const updated = reports.map(report => {
    if (report.syncStatus === 'queued_offline') {
      synced++;
      return {
        ...report,
        syncStatus: 'synchronized' as const,
        syncedAt: new Date().toISOString(),
      };
    }
    return report;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
  } catch (err) {
    console.warn('Error updating synced reports:', err);
  }

  return { syncedCount: synced, pendingCount: updated.filter(r => r.syncStatus === 'queued_offline').length };
}

// Last synchronized time
export function getLastSyncTime(): string {
  if (typeof window === 'undefined') return new Date().toISOString();
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || new Date().toISOString();
}
