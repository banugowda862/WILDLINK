from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    PUBLIC = "public"
    FARMER = "farmer"
    RESIDENT = "resident"
    DRIVER = "driver"
    VOLUNTEER = "volunteer"
    NGO = "ngo"
    RESEARCHER = "researcher"
    VET_RESCUE = "vet_rescue"
    FOREST_OFFICER = "forest_officer"
    ADMIN = "admin"

class DeviceStatusEnum(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    WARNING = "warning"
    MAINTENANCE = "maintenance_required"

class IncidentStatusEnum(str, Enum):
    SUBMITTED = "submitted"
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    ASSIGNED = "assigned"
    RESPONSE_IN_PROGRESS = "response_in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"
    CLOSED = "closed"

class RiskLevelEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class DeviceRegistration(BaseModel):
    device_id: str
    name: str
    installation_area: str
    device_type: str = "thermal_mlx90640_rgb"
    latitude: float
    longitude: float
    secret_token: Optional[str] = "wildlink-secure-token-default"
    software_version: Optional[str] = "v1.2.0"
    created_at: Optional[str] = None

class DeviceHeartbeat(BaseModel):
    device_id: str
    battery_level: float = 100.0
    solar_charging: bool = True
    cpu_usage: float = 15.0
    memory_usage: float = 24.5
    temp_celsius: float = 42.0
    thermal_status: str = "healthy"
    rgb_camera_status: str = "connected"
    timestamp: Optional[str] = None

class DetectionEvent(BaseModel):
    device_id: str
    event_type: str = "wildlife_detection"
    detection_method: str = "thermal"  # "thermal", "rgb", "fusion"
    possible_species: str = "unknown"
    detection_confidence: float = 0.85
    candidate_count: int = 1
    risk_level: RiskLevelEnum = RiskLevelEnum.MEDIUM
    max_temp_celsius: Optional[float] = 34.5
    ambient_temp_celsius: Optional[float] = 23.2
    latitude: float
    longitude: float
    timestamp: Optional[str] = None
    verification_status: str = "pending"
    bounding_boxes: Optional[List[Dict[str, Any]]] = None
    thermal_grid: Optional[List[List[float]]] = None
    simulated: bool = False

class ReportSubmission(BaseModel):
    category: str
    title: str
    description: str
    location_name: str
    latitude: float
    longitude: float
    date_time: Optional[str] = None
    species: Optional[str] = "Unknown"
    severity: RiskLevelEnum = RiskLevelEnum.MEDIUM
    reporter_name: Optional[str] = "Anonymous Citizen"
    reporter_contact: Optional[str] = None
    reporter_role: RoleEnum = RoleEnum.PUBLIC
    image_url: Optional[str] = None
    is_public: bool = True
    privacy_consent: bool = True

class IncidentVerification(BaseModel):
    incident_id: str
    verified: bool
    verified_by: str
    officer_notes: Optional[str] = ""
    assigned_team: Optional[str] = None
    escalate_to_alert: bool = False
    alert_severity: Optional[RiskLevelEnum] = RiskLevelEnum.MEDIUM
    alert_message: Optional[str] = None

class IncidentAssignment(BaseModel):
    incident_id: str
    assigned_team: str
    assigned_by: str
    priority: RiskLevelEnum = RiskLevelEnum.HIGH
    notes: Optional[str] = None

class AlertCreate(BaseModel):
    title: str
    alert_type: str
    severity: RiskLevelEnum = RiskLevelEnum.MEDIUM
    area_name: str
    latitude: float
    longitude: float
    radius_km: float = 5.0
    message: str
    expiry_hours: int = 12
    source: str = "forest_department"
    simulated: bool = False

class RescueCaseCreate(BaseModel):
    animal_type: str
    urgency: str = "medium"
    description: str
    location_name: str
    latitude: float
    longitude: float
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None
    assigned_team: Optional[str] = "Rapid Response Rescue Unit #3"
    veterinarian_name: Optional[str] = "Dr. K. Rao (Wildlife Vet)"

class FarmRegistration(BaseModel):
    owner_id: str
    owner_name: str
    farm_name: str
    location_name: str
    latitude: float
    longitude: float
    size_acres: float
    crops: List[str]
    primary_wildlife_threats: List[str]
    contact_phone: Optional[str] = None

class RoadSafetyZone(BaseModel):
    zone_id: str
    road_name: str
    stretch_km: str
    highway_no: str
    high_risk_species: List[str]
    active_speed_limit_kmh: int = 30
    warning_level: RiskLevelEnum = RiskLevelEnum.MEDIUM
    latitude: float
    longitude: float

class EnvironmentalThreatCreate(BaseModel):
    threat_type: str
    severity: RiskLevelEnum = RiskLevelEnum.HIGH
    title: str
    description: str
    location_name: str
    latitude: float
    longitude: float
    evidence_url: Optional[str] = None

class UserProfile(BaseModel):
    uid: str
    email: str
    display_name: str
    role: RoleEnum = RoleEnum.PUBLIC
    phone: Optional[str] = None
    organization: Optional[str] = None
    created_at: Optional[str] = None
