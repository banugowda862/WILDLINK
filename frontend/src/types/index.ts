export type UserRole =
  | 'public'
  | 'farmer'
  | 'resident'
  | 'driver'
  | 'volunteer'
  | 'ngo'
  | 'researcher'
  | 'vet_rescue'
  | 'forest_officer'
  | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  organization?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface MonitoringDevice {
  device_id: string;
  name: string;
  installation_area: string;
  device_type: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'warning' | 'maintenance_required';
  last_heartbeat: string;
  last_detection?: string | null;
  battery_level: number;
  solar_charging: boolean;
  thermal_sensor_status: string;
  rgb_camera_status: string;
  cpu_usage: number;
  memory_usage: number;
  temp_celsius: number;
  software_version: string;
}

export interface Detection {
  detection_id: string;
  device_id: string;
  timestamp: string;
  event_type: string;
  detection_method: 'thermal' | 'rgb' | 'fusion';
  possible_species: string;
  detection_confidence: number;
  candidate_count: number;
  risk_level: RiskLevel;
  max_temp_celsius?: number;
  ambient_temp_celsius?: number;
  latitude: number;
  longitude: number;
  verification_status: 'pending' | 'verified' | 'false_alarm';
  verified_by?: string | null;
  verification_notes?: string;
  assigned_to?: string | null;
  simulated: boolean;
  bounding_boxes?: Array<{ x: number; y: number; w: number; h: number; label: string }>;
}

export interface IncidentReport {
  report_id: string;
  category: string;
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  date_time: string;
  species: string;
  severity: RiskLevel;
  status:
    | 'submitted'
    | 'pending_verification'
    | 'verified'
    | 'assigned'
    | 'response_in_progress'
    | 'resolved'
    | 'rejected'
    | 'closed';
  assigned_team?: string | null;
  reporter_name: string;
  reporter_contact?: string;
  reporter_role: string;
  is_public: boolean;
  privacy_consent: boolean;
  image_url?: string;
  simulated: boolean;
  verified_by?: string;
  officer_notes?: string;
}

export interface Alert {
  alert_id: string;
  title: string;
  alert_type: string;
  severity: RiskLevel;
  area_name: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  message: string;
  start_time: string;
  expiry_time: string;
  is_active: boolean;
  is_verified: boolean;
  source: string;
  simulated: boolean;
}

export interface RescueCase {
  rescue_id: string;
  animal_type: string;
  urgency: 'low' | 'medium' | 'urgent' | 'life_threatening';
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  status: 'reported' | 'dispatched' | 'under_treatment' | 'rehabilitating' | 'released' | 'deceased';
  assigned_team?: string;
  veterinarian_name?: string;
  created_at: string;
  updated_at: string;
  simulated: boolean;
}

export interface Farm {
  farm_id: string;
  owner_id: string;
  owner_name: string;
  farm_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  size_acres: number;
  crops: string[];
  primary_wildlife_threats: string[];
  contact_phone?: string;
}

export interface RoadSafetyZone {
  zone_id: string;
  road_name: string;
  stretch_km: string;
  highway_no: string;
  high_risk_species: string[];
  active_speed_limit_kmh: number;
  warning_level: RiskLevel;
  latitude: number;
  longitude: number;
}

export interface EnvironmentalThreat {
  threat_id: string;
  threat_type: string;
  severity: RiskLevel;
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  status: string;
  reported_at: string;
}

export interface AuditLog {
  log_id: string;
  timestamp: string;
  actor_email: string;
  actor_role: string;
  action: string;
  target: string;
  details: string;
  ip_address: string;
}
