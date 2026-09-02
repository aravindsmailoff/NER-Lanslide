import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmergencyReport {
  id: string;
  referenceId: string;
  fullName: string;
  contactNumber: string;
  latitude: number | null;
  longitude: number | null;
  landmark: string;
  origin: string;
  needs: string[];
  urgency: 'stable' | 'urgent' | 'critical';
  adults: number;
  children: number;
  elderly: number;
  timestamp: number;
  status: 'PENDING_OFFLINE' | 'SYNCED';
}

export interface RiskAdvisory {
  id: string;
  title: string;
  sector: string;
  type: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  time: string;
  description: string;
  tags: string[];
}

const STORAGE_KEYS = {
  EMERGENCY_QUEUE: '@ner_emergency_queue',
  ADVISORIES_CACHE: '@ner_advisories_cache',
  AUTH_STATE: '@ner_auth_state',
  SETTINGS: '@ner_settings',
  SERVER_URL: '@ner_server_url',
};

export const DEFAULT_SERVER_URL = 'http://10.0.2.2:3000/api';

// Initial default cached advisories for Northeast India (available 100% offline)
const DEFAULT_OFFLINE_ADVISORIES: RiskAdvisory[] = [
  {
    id: 'ADV-LS-204',
    title: 'High Landslide Probability: Bridge-04 Slopes',
    sector: 'SECTOR 4',
    type: 'Soil Saturation Alert',
    level: 'critical',
    time: 'Predicted: 14:00 PM · T+03H',
    description: 'Saturation levels have reached 92%. Predictive models indicate a high risk of slope failure within the next 3 hours. Citizens are advised to avoid lower perimeter roads.',
    tags: ['Precipitation Warning', 'GIS Model: Alpha'],
  },
  {
    id: 'ADV-RF-102',
    title: 'Precipitation Warning: Heavy Inflow',
    sector: 'SECTOR 2',
    type: 'Rainfall Inflow',
    level: 'high',
    time: 'Predicted: 16:30 PM',
    description: 'Sustained rainfall expected to exceed 40mm/hr. Increased runoff may destabilize secondary embankments along NH-37.',
    tags: ['Flood Watch', 'Evacuation Ready'],
  },
  {
    id: 'ADV-SM-701',
    title: 'Soil Moisture Sensor Escalation',
    sector: 'SECTOR 7',
    type: 'Sensor Watch',
    level: 'medium',
    time: '07:30 AM',
    description: 'Sensors in Sector 7 reporting rising saturation levels. Monitoring for potential advisory escalation.',
    tags: ['Telemetry Stream', 'Stable Monitoring'],
  },
  {
    id: 'ADV-SYS-001',
    title: 'GIS Prediction Model: Telemetry Stable',
    sector: 'GLOBAL',
    type: 'Regional Status',
    level: 'low',
    time: '06:00 AM',
    description: 'All landslide monitoring nodes are reporting normal data flow. No immediate anomalous seismic activity detected.',
    tags: ['Network Nominal'],
  },
];

export const OfflineStore = {
  async getServerUrl(): Promise<string> {
    try {
      const url = await AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL);
      return url || DEFAULT_SERVER_URL;
    } catch {
      return DEFAULT_SERVER_URL;
    }
  },

  async setServerUrl(url: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SERVER_URL, url.trim());
  },

  async pingServer(): Promise<{ success: boolean; latencyMs?: number; message?: string }> {
    const baseUrl = await this.getServerUrl();
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${baseUrl}/analytics`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const latencyMs = Date.now() - startTime;
      if (res.ok) {
        return { success: true, latencyMs, message: `Connected (${latencyMs}ms)` };
      }
      return { success: false, message: `HTTP ${res.status}: ${res.statusText}` };
    } catch (e: any) {
      return { success: false, message: e.name === 'AbortError' ? 'Connection timed out' : 'Host unreachable' };
    }
  },

  async getReports(): Promise<EmergencyReport[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load reports:', e);
      return [];
    }
  },

  async saveReport(report: Omit<EmergencyReport, 'id' | 'timestamp' | 'status'>): Promise<EmergencyReport> {
    const newReport: EmergencyReport = {
      ...report,
      id: 'RPT-' + Date.now(),
      timestamp: Date.now(),
      status: 'PENDING_OFFLINE',
    };

    // Attempt direct real-time dispatch to Command Center API
    try {
      const serverUrl = await this.getServerUrl();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${serverUrl}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        newReport.status = 'SYNCED';
      }
    } catch (err) {
      // Network down / offline: will remain PENDING_OFFLINE for automatic sync
      console.log('Network unavailable, report retained in offline write-ahead log:', err);
    }

    const existing = await this.getReports();
    const updated = [newReport, ...existing];
    await AsyncStorage.setItem(STORAGE_KEYS.EMERGENCY_QUEUE, JSON.stringify(updated));
    return newReport;
  },

  async markReportSynced(id: string): Promise<void> {
    const existing = await this.getReports();
    const updated = existing.map(r => (r.id === id ? { ...r, status: 'SYNCED' as const } : r));
    await AsyncStorage.setItem(STORAGE_KEYS.EMERGENCY_QUEUE, JSON.stringify(updated));
  },

  async getAdvisories(): Promise<RiskAdvisory[]> {
    try {
      // Try to fetch latest from server if online
      const serverUrl = await this.getServerUrl();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${serverUrl}/advisories`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          await AsyncStorage.setItem(STORAGE_KEYS.ADVISORIES_CACHE, JSON.stringify(json));
          return json;
        }
      }
    } catch {
      // Fallback to local cache
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ADVISORIES_CACHE);
      if (data) return JSON.parse(data);
      await AsyncStorage.setItem(STORAGE_KEYS.ADVISORIES_CACHE, JSON.stringify(DEFAULT_OFFLINE_ADVISORIES));
      return DEFAULT_OFFLINE_ADVISORIES;
    } catch (e) {
      return DEFAULT_OFFLINE_ADVISORIES;
    }
  },

  async getPendingSyncCount(): Promise<number> {
    const reports = await this.getReports();
    return reports.filter(r => r.status === 'PENDING_OFFLINE').length;
  },

  async syncAllPending(): Promise<{ syncedCount: number; failedCount: number }> {
    const reports = await this.getReports();
    const pending = reports.filter(r => r.status === 'PENDING_OFFLINE');
    if (pending.length === 0) return { syncedCount: 0, failedCount: 0 };

    const serverUrl = await this.getServerUrl();
    let syncedCount = 0;
    let failedCount = 0;

    for (const r of pending) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${serverUrl}/incidents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(r),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          await this.markReportSynced(r.id);
          syncedCount++;
        } else {
          failedCount++;
        }
      } catch (err) {
        failedCount++;
      }
    }

    return { syncedCount, failedCount };
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.EMERGENCY_QUEUE);
  },
};
