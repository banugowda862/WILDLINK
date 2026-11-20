import type {
  MonitoringDevice,
  Detection,
  IncidentReport,
  Alert,
  RescueCase,
  Farm,
  RoadSafetyZone,
  EnvironmentalThreat,
  AuditLog
} from '../types';

const BASE_URL = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string; demo_mode: boolean; devices_count: number }>('/health'),

  // Devices
  getDevices: () => fetchJson<MonitoringDevice[]>('/devices'),
  getDeviceStatus: () => fetchJson<{ total_devices: number; online_devices: number; warning_devices: number; offline_devices: number; devices: MonitoringDevice[] }>('/devices/status'),
  registerDevice: (data: Partial<MonitoringDevice>) => fetchJson('/devices/register', { method: 'POST', body: JSON.stringify(data) }),

  // Detections
  getDetections: (includeSimulated = true) => fetchJson<Detection[]>(`/detections?include_simulated=${includeSimulated}`),
  createDetection: (data: Partial<Detection>) => fetchJson('/detections', { method: 'POST', body: JSON.stringify(data) }),

  // Reports / Incidents
  getReports: (category?: string, status?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    return fetchJson<IncidentReport[]>(`/reports?${params.toString()}`);
  },
  submitReport: (data: Partial<IncidentReport>) => fetchJson<{ status: string; report: IncidentReport }>('/reports', { method: 'POST', body: JSON.stringify(data) }),
  verifyIncident: (incidentId: string, verified: boolean, officerName: string, notes = '', escalate = false, alertSeverity = 'warning', alertMessage = '') =>
    fetchJson('/incidents/verify', {
      method: 'POST',
      body: JSON.stringify({
        incident_id: incidentId,
        verified,
        verified_by: officerName,
        officer_notes: notes,
        escalate_to_alert: escalate,
        alert_severity: alertSeverity,
        alert_message: alertMessage
      })
    }),
  assignIncident: (incidentId: string, assignedTeam: string, assignedBy: string) =>
    fetchJson('/incidents/assign', {
      method: 'POST',
      body: JSON.stringify({
        incident_id: incidentId,
        assigned_team: assignedTeam,
        assigned_by: assignedBy
      })
    }),

  // Alerts
  getAlerts: (onlyActive = true, includeSimulated = true) =>
    fetchJson<Alert[]>(`/alerts?only_active=${onlyActive}&include_simulated=${includeSimulated}`),
  createAlert: (data: Partial<Alert>) => fetchJson('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  resolveAlert: (alertId: string) => fetchJson(`/alerts/${alertId}/resolve`, { method: 'PUT' }),

  // Rescue
  getRescueCases: () => fetchJson<RescueCase[]>('/rescue-cases'),
  createRescueCase: (data: Partial<RescueCase>) => fetchJson('/rescue-cases', { method: 'POST', body: JSON.stringify(data) }),
  updateRescueStatus: (rescueId: string, status: string, notes?: string) =>
    fetchJson(`/rescue-cases/${rescueId}/status?status=${status}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`, { method: 'PUT' }),

  // Farms
  getFarms: () => fetchJson<Farm[]>('/farms'),
  registerFarm: (data: Partial<Farm>) => fetchJson('/farms', { method: 'POST', body: JSON.stringify(data) }),

  // Road Zones & Environmental Threats
  getRoadZones: () => fetchJson<RoadSafetyZone[]>('/road-zones'),
  getEnvironmentalThreats: () => fetchJson<EnvironmentalThreat[]>('/environmental-threats'),
  createEnvironmentalThreat: (data: Partial<EnvironmentalThreat>) =>
    fetchJson('/environmental-threats', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics
  getAnalytics: () => fetchJson<any>('/analytics/overview'),

  // Audit Logs & Settings
  getAuditLogs: () => fetchJson<AuditLog[]>('/audit-logs'),
  getSettings: () => fetchJson<Record<string, any>>('/settings'),

  // Demo controls
  triggerDemoScenario: (scenario: 'elephant_highway' | 'wild_boar_farm' | 'predator_perimeter') =>
    fetchJson(`/demo/simulate-trigger?scenario=${scenario}`, { method: 'POST' }),
  resetDemoData: () => fetchJson('/demo/reset', { method: 'POST' })
};
