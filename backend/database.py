import os
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional

logger = logging.getLogger("wildlink.db")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_FILE = os.path.join(DATA_DIR, "wildlink_db.json")

def get_current_iso_time():
    return datetime.now(timezone.utc).isoformat()

def get_default_seed_data() -> Dict[str, Any]:
    now = get_current_iso_time()
    two_hours_ago = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    five_hours_ago = (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat()
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    future_alert = (datetime.now(timezone.utc) + timedelta(hours=10)).isoformat()

    return {
        "devices": [
            {
                "device_id": "WILDLINK-ROAD-001",
                "name": "Bandipur NH-766 Wildlife Crossing Post A1",
                "installation_area": "Bandipur Forest Corridor Km 24",
                "device_type": "thermal_mlx90640_rgb",
                "latitude": 11.6664,
                "longitude": 76.6291,
                "status": "online",
                "last_heartbeat": now,
                "last_detection": two_hours_ago,
                "battery_level": 94.5,
                "solar_charging": True,
                "thermal_sensor_status": "healthy",
                "rgb_camera_status": "connected",
                "cpu_usage": 18.2,
                "memory_usage": 32.1,
                "temp_celsius": 39.5,
                "software_version": "v1.2.0",
                "secret_token": "dev-token-road-001"
            },
            {
                "device_id": "WILDLINK-FARM-002",
                "name": "Nagarhole Border Crop Sentry Alpha",
                "installation_area": "Kutta Agri-Forest Buffer Zone",
                "device_type": "thermal_mlx90640_rgb",
                "latitude": 11.9842,
                "longitude": 76.0125,
                "status": "online",
                "last_heartbeat": now,
                "last_detection": five_hours_ago,
                "battery_level": 88.0,
                "solar_charging": True,
                "thermal_sensor_status": "healthy",
                "rgb_camera_status": "connected",
                "cpu_usage": 14.5,
                "memory_usage": 28.0,
                "temp_celsius": 37.8,
                "software_version": "v1.2.0",
                "secret_token": "dev-token-farm-002"
            },
            {
                "device_id": "WILDLINK-CORRIDOR-003",
                "name": "Brahmagiri Ridge Pass Watcher",
                "installation_area": "Brahmagiri Wildlife Sanctuary East Rim",
                "device_type": "thermal_mlx90640",
                "latitude": 11.9210,
                "longitude": 75.9540,
                "status": "warning",
                "last_heartbeat": now,
                "last_detection": yesterday,
                "battery_level": 42.0,
                "solar_charging": False,
                "thermal_sensor_status": "optical_dust_warning",
                "rgb_camera_status": "not_equipped",
                "cpu_usage": 22.0,
                "memory_usage": 45.0,
                "temp_celsius": 41.2,
                "software_version": "v1.1.8",
                "secret_token": "dev-token-corridor-003"
            },
            {
                "device_id": "WILDLINK-RESCUE-004",
                "name": "Kabini River Confluence Station",
                "installation_area": "Kabini Backwaters Edge Sector 9",
                "device_type": "thermal_mlx90640_rgb",
                "latitude": 11.8900,
                "longitude": 76.2400,
                "status": "offline",
                "last_heartbeat": yesterday,
                "last_detection": yesterday,
                "battery_level": 5.0,
                "solar_charging": False,
                "thermal_sensor_status": "offline_no_power",
                "rgb_camera_status": "offline",
                "cpu_usage": 0.0,
                "memory_usage": 0.0,
                "temp_celsius": 0.0,
                "software_version": "v1.2.0",
                "secret_token": "dev-token-rescue-004"
            }
        ],
        "detections": [
            {
                "detection_id": "DET-2026-001",
                "device_id": "WILDLINK-ROAD-001",
                "timestamp": two_hours_ago,
                "event_type": "wildlife_detection",
                "detection_method": "thermal",
                "possible_species": "Asian Elephant (Candidate)",
                "detection_confidence": 0.88,
                "candidate_count": 2,
                "risk_level": "high",
                "max_temp_celsius": 36.2,
                "ambient_temp_celsius": 22.4,
                "latitude": 11.6664,
                "longitude": 76.6291,
                "verification_status": "verified",
                "verified_by": "Officer M. Deshmukh (Range Officer)",
                "verification_notes": "Confirmed thermal signature consistent with 2 adult pachyderms approaching roadway.",
                "assigned_to": "NH Rapid Patrolling Team 2",
                "simulated": False,
                "bounding_boxes": [{"x": 12, "y": 8, "w": 8, "h": 10, "label": "Large thermal mass"}]
            },
            {
                "detection_id": "DET-2026-002",
                "device_id": "WILDLINK-FARM-002",
                "timestamp": five_hours_ago,
                "event_type": "wildlife_detection",
                "detection_method": "fusion",
                "possible_species": "Wild Boar (Sus scrofa)",
                "detection_confidence": 0.79,
                "candidate_count": 4,
                "risk_level": "medium",
                "max_temp_celsius": 37.8,
                "ambient_temp_celsius": 21.0,
                "latitude": 11.9842,
                "longitude": 76.0125,
                "verification_status": "pending",
                "verified_by": None,
                "verification_notes": "",
                "assigned_to": "Kutta Farmer Cooperative Early Guard",
                "simulated": False,
                "bounding_boxes": [{"x": 5, "y": 14, "w": 4, "h": 5, "label": "Troop movement"}]
            },
            {
                "detection_id": "DET-2026-DEMO-003",
                "device_id": "WILDLINK-ROAD-001",
                "timestamp": now,
                "event_type": "wildlife_detection",
                "detection_method": "thermal",
                "possible_species": "Spotted Deer (Axis axis) [SIMULATED]",
                "detection_confidence": 0.82,
                "candidate_count": 3,
                "risk_level": "medium",
                "max_temp_celsius": 35.1,
                "ambient_temp_celsius": 23.0,
                "latitude": 11.6710,
                "longitude": 76.6340,
                "verification_status": "pending",
                "verified_by": None,
                "verification_notes": "Fictional scenario for platform evaluation",
                "assigned_to": None,
                "simulated": True,
                "bounding_boxes": [{"x": 18, "y": 10, "w": 5, "h": 7, "label": "Simulated heat cluster"}]
            }
        ],
        "reports": [
            {
                "report_id": "REP-2026-8801",
                "category": "animal_crossing",
                "title": "Elephant herd moving towards NH-766 bypass",
                "description": "Observed 3 elephants grazing roughly 150m from highway edge near kilometer stone 24. Visible from vehicle.",
                "location_name": "Bandipur Highway Km 24",
                "latitude": 11.6664,
                "longitude": 76.6291,
                "date_time": two_hours_ago,
                "species": "Asian Elephant",
                "severity": "high",
                "status": "verified",
                "assigned_team": "Forest Highway Squad A",
                "reporter_name": "Rajesh Gowda (Bus Driver)",
                "reporter_contact": "+91 98451 00000",
                "reporter_role": "driver",
                "is_public": True,
                "privacy_consent": True,
                "simulated": False
            },
            {
                "report_id": "REP-2026-8802",
                "category": "crop_damage",
                "title": "Wild boar herd damaged maize and tapioca field",
                "description": "Around 15 wild boars entered the north boundary fence around 2:00 AM. Half an acre of harvest-ready maize ruined.",
                "location_name": "Kutta Village - Farm plot 12",
                "latitude": 11.9842,
                "longitude": 76.0125,
                "date_time": yesterday,
                "species": "Wild Boar",
                "severity": "medium",
                "status": "response_in_progress",
                "assigned_team": "Hunsur Agro-Conflict Officer",
                "reporter_name": "Somanna B. (Farmer)",
                "reporter_contact": "+91 94481 00000",
                "reporter_role": "farmer",
                "is_public": True,
                "privacy_consent": True,
                "simulated": False
            },
            {
                "report_id": "REP-2026-8803",
                "category": "injured_animal",
                "title": "Juvenile spotted deer limping near forest stream",
                "description": "Young chital deer has a visible laceration on left hind leg, moving very slowly near water canal.",
                "location_name": "Nagarhole South Buffer Canal",
                "latitude": 11.9500,
                "longitude": 76.1000,
                "date_time": five_hours_ago,
                "species": "Spotted Deer (Chital)",
                "severity": "urgent",
                "status": "assigned",
                "assigned_team": "Wildlife Rescue Mobile Ambulance #2",
                "reporter_name": "Kavitha N. (Resident / Volunteer)",
                "reporter_contact": "+91 91234 56789",
                "reporter_role": "resident",
                "is_public": False,
                "privacy_consent": True,
                "simulated": False
            },
            {
                "report_id": "REP-2026-8804",
                "category": "poaching_threat",
                "title": "Suspicious wire snare discovered in secondary forest edge",
                "description": "Wire snare anchored to teak sapling noticed while checking perimeter fence. Removed and marked location.",
                "location_name": "Moyar Valley Peripheral Sector",
                "latitude": 11.5800,
                "longitude": 76.7100,
                "date_time": yesterday,
                "species": "Multiple target species",
                "severity": "critical",
                "status": "verified",
                "assigned_team": "Anti-Poaching Camp (APC) Watchers",
                "reporter_name": "Verified NGO Field Worker",
                "reporter_contact": "+91 99000 11223",
                "reporter_role": "ngo",
                "is_public": False,
                "privacy_consent": True,
                "simulated": False
            },
            {
                "report_id": "REP-2026-DEMO-8805",
                "category": "residential_sighting",
                "title": "Bonnet macaque troop foraging near primary school grounds",
                "description": "Simulated demonstration scenario: troop of 12 monkeys near food waste bins. No human conflict, children advised to stay indoors.",
                "location_name": "Gundlupet Buffer Settlement",
                "latitude": 11.7900,
                "longitude": 76.6800,
                "date_time": now,
                "species": "Bonnet Macaque [DEMO]",
                "severity": "low",
                "status": "pending_verification",
                "assigned_team": None,
                "reporter_name": "School Headmaster",
                "reporter_contact": "+91 94488 77665",
                "reporter_role": "resident",
                "is_public": True,
                "privacy_consent": True,
                "simulated": True
            }
        ],
        "alerts": [
            {
                "alert_id": "ALT-2026-101",
                "title": "Active Wildlife Crossing Caution: NH-766",
                "alert_type": "wildlife_crossing",
                "severity": "warning",
                "area_name": "Bandipur Forest Corridor Km 22 - 27",
                "latitude": 11.6664,
                "longitude": 76.6291,
                "radius_km": 5.0,
                "message": "Thermal sensors and verified citizen reports confirm elephant presence near roadway. Reduce speed to under 30 km/h, avoid honking and remain inside vehicles.",
                "start_time": two_hours_ago,
                "expiry_time": future_alert,
                "is_active": True,
                "is_verified": True,
                "source": "forest_department",
                "simulated": False
            },
            {
                "alert_id": "ALT-2026-102",
                "title": "Crop Intrusion Advisory: Wild Boar Nocturnal Movement",
                "alert_type": "crop_threat",
                "severity": "info",
                "area_name": "Kutta & Virajpet Agro Fringe",
                "latitude": 11.9842,
                "longitude": 76.0125,
                "radius_km": 8.0,
                "message": "Seasonal harvest advisory. Farmers are encouraged to use acoustic bio-acoustic buzzers and solar blinking deterrents. Poisoning or electrocution is strictly prohibited by law.",
                "start_time": yesterday,
                "expiry_time": future_alert,
                "is_active": True,
                "is_verified": True,
                "source": "agro_wildlife_desk",
                "simulated": False
            },
            {
                "alert_id": "ALT-2026-DEMO-103",
                "title": "[DEMO] Forest Fire Smoke Risk Detected Near Ridge 4",
                "alert_type": "forest_fire",
                "severity": "danger",
                "area_name": "Brahmagiri Northern Foothills [DEMO SCENARIO]",
                "latitude": 11.9300,
                "longitude": 75.9600,
                "radius_km": 4.0,
                "message": "Demonstration warning: elevated heat signature reported. Rapid forest fire prevention team mobilised for drill.",
                "start_time": now,
                "expiry_time": future_alert,
                "is_active": True,
                "is_verified": False,
                "source": "simulated_sensor",
                "simulated": True
            }
        ],
        "rescue_cases": [
            {
                "rescue_id": "RESCUE-2026-01",
                "animal_type": "Spotted Deer (Chital)",
                "urgency": "urgent",
                "description": "Laceration on left hind leg requiring surgical dressing and antibiotic administration.",
                "location_name": "Nagarhole Buffer Sector 4",
                "latitude": 11.9500,
                "longitude": 76.1000,
                "status": "dispatched",
                "assigned_team": "Wildlife Rescue Mobile Ambulance #2",
                "veterinarian_name": "Dr. K. Rao (Wildlife Vet)",
                "created_at": five_hours_ago,
                "updated_at": two_hours_ago,
                "simulated": False
            },
            {
                "rescue_id": "RESCUE-2026-02",
                "animal_type": "Barn Owl (Tyto alba)",
                "urgency": "medium",
                "description": "Entangled in synthetic kite string hanging from roadside eucalyptus branch.",
                "location_name": "Gundlupet Agricultural Periphery",
                "latitude": 11.8100,
                "longitude": 76.6700,
                "status": "under_treatment",
                "assigned_team": "Avian Rescue Volunteers",
                "veterinarian_name": "Dr. Ananya Murthy",
                "created_at": yesterday,
                "updated_at": five_hours_ago,
                "simulated": False
            }
        ],
        "farms": [
            {
                "farm_id": "FARM-2026-01",
                "owner_id": "USR-FARMER-01",
                "owner_name": "Somanna B.",
                "farm_name": "Cauvery Border Agro Farms",
                "location_name": "Kutta Agro-Forest Buffer",
                "latitude": 11.9842,
                "longitude": 76.0125,
                "size_acres": 12.5,
                "crops": ["Maize", "Coffee", "Pepper", "Banana"],
                "primary_wildlife_threats": ["Wild Boar", "Asian Elephant", "Bonnet Macaque"],
                "contact_phone": "+91 94481 00000"
            },
            {
                "farm_id": "FARM-2026-02",
                "owner_id": "USR-FARMER-02",
                "owner_name": "Lakshmamma C.",
                "farm_name": "Green Ridge Organic Plantation",
                "location_name": "Virajpet Fringe",
                "latitude": 12.1800,
                "longitude": 75.8200,
                "size_acres": 8.0,
                "crops": ["Cardamom", "Paddy", "Arecanut"],
                "primary_wildlife_threats": ["Asian Elephant", "Wild Boar"],
                "contact_phone": "+91 98455 12345"
            }
        ],
        "road_zones": [
            {
                "zone_id": "ZONE-NH-766",
                "road_name": "NH-766 Mysore - Ooty / Wayanad Highway",
                "stretch_km": "Km 20.0 to Km 38.5 (Bandipur Core Stretch)",
                "highway_no": "NH-766",
                "high_risk_species": ["Asian Elephant", "Tiger", "Spotted Deer", "Indian Gaur"],
                "active_speed_limit_kmh": 30,
                "warning_level": "high",
                "latitude": 11.6664,
                "longitude": 76.6291
            },
            {
                "zone_id": "ZONE-SH-33",
                "road_name": "SH-33 Mananthavady - Mysore Highway",
                "stretch_km": "Bavali checkpost to Antharasanthe",
                "highway_no": "SH-33",
                "high_risk_species": ["Spotted Deer", "Wild Boar", "Leopard"],
                "active_speed_limit_kmh": 40,
                "warning_level": "medium",
                "latitude": 11.9200,
                "longitude": 76.2200
            }
        ],
        "environmental_threats": [
            {
                "threat_id": "ENV-2026-01",
                "threat_type": "forest_fire",
                "severity": "high",
                "title": "Dry bamboo clump fire hazard in Western Sector",
                "description": "High fuel load of fallen dead bamboo during dry windy season. Controlled patrol initiated.",
                "location_name": "Nagarhole Western Boundary",
                "latitude": 11.9800,
                "longitude": 76.0800,
                "status": "monitored",
                "reported_at": yesterday
            },
            {
                "threat_id": "ENV-2026-02",
                "threat_type": "water_scarcity",
                "severity": "medium",
                "title": "Natural waterhole drying prematurely",
                "description": "Solar borewell refilling mechanism required for local herbivore population.",
                "location_name": "Bandipur Range 3 Checkdam",
                "latitude": 11.6400,
                "longitude": 76.5900,
                "status": "action_pending",
                "reported_at": two_hours_ago
            }
        ],
        "audit_logs": [
            {
                "log_id": "LOG-1001",
                "timestamp": now,
                "actor_email": "admin@wildlink.org",
                "actor_role": "admin",
                "action": "SYSTEM_STARTUP",
                "target": "WILDLINK Core Services",
                "details": "Platform initialized with secure multi-tenant role definitions and IoT device registry.",
                "ip_address": "127.0.0.1"
            }
        ],
        "settings": {
            "demo_mode": True,
            "fcm_notifications_enabled": False,
            "thermal_duplicate_suppression_window_sec": 120,
            "min_detection_confidence_alert": 0.75,
            "max_public_map_jitter_meters": 800,
            "allow_citizen_media_upload": True,
            "contact_emergency_hotline": "+91 1800-WILD-LINK (1800-945-3546)"
        }
    }

class Database:
    def __init__(self):
        self._ensure_dir()
        self.data: Dict[str, Any] = self._load()

    def _ensure_dir(self):
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR, exist_ok=True)

    def _load(self) -> Dict[str, Any]:
        if os.path.exists(DB_FILE):
            try:
                with open(DB_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading database file: {e}. Falling back to default seed.")
        
        initial = get_default_seed_data()
        self._save_raw(initial)
        return initial

    def _save_raw(self, payload: Dict[str, Any]):
        try:
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2)
        except Exception as e:
            logger.error(f"Error writing to database: {e}")

    def save(self):
        self._save_raw(self.data)

    def reset_to_seed(self):
        self.data = get_default_seed_data()
        self.save()
        return self.data

db = Database()
