import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Header, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models import (
    DeviceRegistration,
    DeviceHeartbeat,
    DetectionEvent,
    ReportSubmission,
    IncidentVerification,
    IncidentAssignment,
    AlertCreate,
    RescueCaseCreate,
    FarmRegistration,
    RoadSafetyZone,
    EnvironmentalThreatCreate,
    UserProfile,
    RoleEnum,
    RiskLevelEnum
)
from database import db, get_current_iso_time

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("wildlink.api")

app = FastAPI(
    title="WILDLINK API",
    description="Intelligent Wildlife Protection, Early Detection & Conservation Platform REST API",
    version="1.2.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def log_audit(actor_email: str, actor_role: str, action: str, target: str, details: str):
    log_entry = {
        "log_id": f"LOG-{uuid.uuid4().hex[:8].upper()}",
        "timestamp": get_current_iso_time(),
        "actor_email": actor_email,
        "actor_role": actor_role,
        "action": action,
        "target": target,
        "details": details,
        "ip_address": "127.0.0.1"
    }
    db.data["audit_logs"].insert(0, log_entry)
    # keep last 200 logs
    if len(db.data["audit_logs"]) > 200:
        db.data["audit_logs"] = db.data["audit_logs"][:200]
    db.save()

@app.get("/api/v1/health")
def get_health():
    return {
        "status": "healthy",
        "service": "WILDLINK Core API",
        "version": "1.2.0",
        "timestamp": get_current_iso_time(),
        "database": "online",
        "demo_mode": db.data["settings"].get("demo_mode", True),
        "devices_count": len(db.data.get("devices", [])),
        "active_alerts_count": len([a for a in db.data.get("alerts", []) if a.get("is_active")]),
        "firebase_configured": bool(os.environ.get("FIREBASE_CREDENTIALS"))
    }

# --- Device Endpoints ---

@app.post("/api/v1/devices/register", status_code=status.HTTP_201_CREATED)
def register_device(device: DeviceRegistration):
    # Check if exists
    for d in db.data["devices"]:
        if d["device_id"] == device.device_id:
            d["name"] = device.name
            d["installation_area"] = device.installation_area
            d["latitude"] = device.latitude
            d["longitude"] = device.longitude
            d["status"] = "online"
            d["last_heartbeat"] = get_current_iso_time()
            db.save()
            log_audit("system", "admin", "DEVICE_UPDATED", device.device_id, f"Device {device.device_id} updated")
            return {"status": "updated", "device_id": device.device_id}

    new_device = {
        "device_id": device.device_id,
        "name": device.name,
        "installation_area": device.installation_area,
        "device_type": device.device_type,
        "latitude": device.latitude,
        "longitude": device.longitude,
        "status": "online",
        "last_heartbeat": get_current_iso_time(),
        "last_detection": None,
        "battery_level": 100.0,
        "solar_charging": True,
        "thermal_sensor_status": "healthy",
        "rgb_camera_status": "connected",
        "cpu_usage": 10.0,
        "memory_usage": 20.0,
        "temp_celsius": 38.0,
        "software_version": device.software_version or "v1.2.0",
        "secret_token": device.secret_token or f"tok_{uuid.uuid4().hex[:12]}"
    }
    db.data["devices"].append(new_device)
    db.save()
    log_audit("system", "admin", "DEVICE_REGISTERED", device.device_id, f"Registered new monitoring device {device.name}")
    return {"status": "registered", "device": new_device}

@app.post("/api/v1/devices/heartbeat")
def device_heartbeat(heartbeat: DeviceHeartbeat, x_device_token: Optional[str] = Header(None)):
    target = None
    for d in db.data["devices"]:
        if d["device_id"] == heartbeat.device_id:
            target = d
            break
    
    if not target:
        raise HTTPException(status_code=404, detail="Device not found. Please register first.")

    target["last_heartbeat"] = heartbeat.timestamp or get_current_iso_time()
    target["battery_level"] = heartbeat.battery_level
    target["solar_charging"] = heartbeat.solar_charging
    target["cpu_usage"] = heartbeat.cpu_usage
    target["memory_usage"] = heartbeat.memory_usage
    target["temp_celsius"] = heartbeat.temp_celsius
    target["thermal_sensor_status"] = heartbeat.thermal_status
    target["rgb_camera_status"] = heartbeat.rgb_camera_status
    target["status"] = "online" if heartbeat.thermal_status == "healthy" else "warning"
    db.save()

    return {"status": "received", "device_id": heartbeat.device_id, "server_time": get_current_iso_time()}

@app.get("/api/v1/devices/status")
def get_device_status_overview():
    devices = db.data.get("devices", [])
    total = len(devices)
    online = len([d for d in devices if d.get("status") == "online"])
    warning = len([d for d in devices if d.get("status") == "warning"])
    offline = len([d for d in devices if d.get("status") == "offline"])

    return {
        "total_devices": total,
        "online_devices": online,
        "warning_devices": warning,
        "offline_devices": offline,
        "devices": devices
    }

@app.get("/api/v1/devices")
def list_devices():
    return db.data.get("devices", [])

@app.get("/api/v1/devices/{device_id}")
def get_device(device_id: str):
    for d in db.data.get("devices", []):
        if d["device_id"] == device_id:
            return d
    raise HTTPException(status_code=404, detail="Device not found")

# --- Detection Endpoints ---

@app.post("/api/v1/detections", status_code=status.HTTP_201_CREATED)
def record_detection(event: DetectionEvent, x_device_token: Optional[str] = Header(None)):
    now_iso = event.timestamp or get_current_iso_time()
    detection_id = f"DET-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    # Duplicate suppression check (within last 90 seconds for same device & candidate count)
    cutoff = datetime.now(timezone.utc).timestamp() - 90
    for prev in db.data.get("detections", []):
        if prev["device_id"] == event.device_id and prev.get("possible_species") == event.possible_species:
            try:
                prev_time = datetime.fromisoformat(prev["timestamp"]).timestamp()
                if prev_time > cutoff:
                    logger.info(f"Duplicate detection suppressed for device {event.device_id}")
                    return {"status": "suppressed_duplicate", "previous_detection_id": prev["detection_id"]}
            except Exception:
                pass

    record = {
        "detection_id": detection_id,
        "device_id": event.device_id,
        "timestamp": now_iso,
        "event_type": event.event_type,
        "detection_method": event.detection_method,
        "possible_species": event.possible_species,
        "detection_confidence": event.detection_confidence,
        "candidate_count": event.candidate_count,
        "risk_level": event.risk_level.value,
        "max_temp_celsius": event.max_temp_celsius,
        "ambient_temp_celsius": event.ambient_temp_celsius,
        "latitude": event.latitude,
        "longitude": event.longitude,
        "verification_status": event.verification_status,
        "verified_by": None,
        "verification_notes": "",
        "assigned_to": None,
        "simulated": event.simulated,
        "bounding_boxes": event.bounding_boxes or [{"x": 10, "y": 10, "w": 6, "h": 6, "label": "Candidate Heat Source"}]
    }

    db.data["detections"].insert(0, record)

    # Update device last_detection and status
    for d in db.data["devices"]:
        if d["device_id"] == event.device_id:
            d["last_detection"] = now_iso
            break

    # If critical / high risk, auto-create a pending incident for forest officers
    if event.risk_level in [RiskLevelEnum.HIGH, RiskLevelEnum.CRITICAL] and not event.simulated:
        incident_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
        incident_record = {
            "incident_id": incident_id,
            "category": "thermal_sensor_detection",
            "title": f"Automated Thermal Detection: {event.possible_species} near {event.device_id}",
            "description": f"Thermal array registered candidate heat signature at {event.latitude}, {event.longitude} with {int(event.detection_confidence * 100)}% confidence.",
            "location_name": f"Sensor Post {event.device_id}",
            "latitude": event.latitude,
            "longitude": event.longitude,
            "date_time": now_iso,
            "species": event.possible_species,
            "severity": event.risk_level.value,
            "status": "pending_verification",
            "assigned_team": None,
            "reporter_name": f"Automated Sensor ({event.device_id})",
            "reporter_contact": "System",
            "reporter_role": "sensor_ai",
            "is_public": False,
            "privacy_consent": True,
            "simulated": event.simulated
        }
        db.data["reports"].insert(0, incident_record)

    db.save()
    log_audit("system", "sensor_node", "DETECTION_RECORDED", detection_id, f"Recorded detection for {event.device_id}: {event.possible_species}")
    return {"status": "created", "detection": record}

@app.get("/api/v1/detections")
def list_detections(limit: int = 50, include_simulated: bool = True):
    records = db.data.get("detections", [])
    if not include_simulated:
        records = [r for r in records if not r.get("simulated")]
    return records[:limit]

@app.get("/api/v1/detections/{detection_id}")
def get_detection(detection_id: str):
    for r in db.data.get("detections", []):
        if r["detection_id"] == detection_id:
            return r
    raise HTTPException(status_code=404, detail="Detection not found")

# --- Reports & Incidents Endpoints ---

@app.post("/api/v1/reports", status_code=status.HTTP_201_CREATED)
def submit_report(report: ReportSubmission):
    report_id = f"REP-{datetime.now().strftime('%Y')}-{uuid.uuid4().hex[:6].upper()}"
    now_iso = report.date_time or get_current_iso_time()

    record = {
        "report_id": report_id,
        "category": report.category,
        "title": report.title,
        "description": report.description,
        "location_name": report.location_name,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "date_time": now_iso,
        "species": report.species or "Unknown",
        "severity": report.severity.value,
        "status": "pending_verification",
        "assigned_team": None,
        "reporter_name": report.reporter_name or "Anonymous",
        "reporter_contact": report.reporter_contact,
        "reporter_role": report.reporter_role.value,
        "is_public": report.is_public,
        "privacy_consent": report.privacy_consent,
        "image_url": report.image_url,
        "simulated": False
    }

    db.data["reports"].insert(0, record)
    db.save()
    log_audit(report.reporter_name or "citizen", report.reporter_role.value, "REPORT_SUBMITTED", report_id, f"Submitted report: {report.title}")
    return {"status": "submitted", "report": record}

@app.get("/api/v1/reports")
def list_reports(category: Optional[str] = None, status: Optional[str] = None):
    results = db.data.get("reports", [])
    if category:
        results = [r for r in results if r.get("category") == category]
    if status:
        results = [r for r in results if r.get("status") == status]
    return results

@app.get("/api/v1/reports/{report_id}")
def get_report(report_id: str):
    for r in db.data.get("reports", []):
        if r["report_id"] == report_id:
            return r
    raise HTTPException(status_code=404, detail="Report not found")

@app.get("/api/v1/incidents")
def list_incidents(only_verified: bool = False):
    reports = db.data.get("reports", [])
    if only_verified:
        return [r for r in reports if r.get("status") in ["verified", "assigned", "response_in_progress"]]
    return reports

@app.post("/api/v1/incidents/verify")
def verify_incident(payload: IncidentVerification):
    target = None
    for r in db.data.get("reports", []):
        if r["report_id"] == payload.incident_id:
            target = r
            break
    
    # Check detections as well
    target_det = None
    for d in db.data.get("detections", []):
        if d["detection_id"] == payload.incident_id:
            target_det = d
            break

    if not target and not target_det:
        raise HTTPException(status_code=404, detail="Incident or Detection ID not found")

    new_status = "verified" if payload.verified else "rejected"
    if target:
        target["status"] = new_status
        target["verified_by"] = payload.verified_by
        target["officer_notes"] = payload.officer_notes
        if payload.assigned_team:
            target["assigned_team"] = payload.assigned_team
            target["status"] = "assigned"

    if target_det:
        target_det["verification_status"] = "verified" if payload.verified else "false_alarm"
        target_det["verified_by"] = payload.verified_by
        target_det["verification_notes"] = payload.officer_notes

    # Escalate to public alert if requested
    if payload.verified and payload.escalate_to_alert:
        src = target or target_det
        alert_id = f"ALT-{datetime.now().strftime('%Y')}-{uuid.uuid4().hex[:5].upper()}"
        alert = {
            "alert_id": alert_id,
            "title": f"Verified Wildlife Alert: {src.get('species') or src.get('possible_species', 'Wildlife Activity')}",
            "alert_type": "wildlife_crossing" if "road" in str(src.get("category", "")).lower() else "crop_threat",
            "severity": payload.alert_severity.value if payload.alert_severity else "warning",
            "area_name": src.get("location_name", "Forest Boundary Buffer"),
            "latitude": src.get("latitude", 12.0),
            "longitude": src.get("longitude", 76.0),
            "radius_km": 5.0,
            "message": payload.alert_message or f"Verified {src.get('species')} activity confirmed by {payload.verified_by}. Please proceed with caution.",
            "start_time": get_current_iso_time(),
            "expiry_time": (datetime.now(timezone.utc) + timedelta(hours=12)).isoformat(),
            "is_active": True,
            "is_verified": True,
            "source": "forest_department",
            "simulated": src.get("simulated", False)
        }
        db.data["alerts"].insert(0, alert)

    db.save()
    log_audit(payload.verified_by, "forest_officer", "INCIDENT_VERIFICATION", payload.incident_id, f"Set verification status to {new_status}")
    return {"status": "updated", "incident_id": payload.incident_id, "verification": new_status}

@app.post("/api/v1/incidents/assign")
def assign_incident(payload: IncidentAssignment):
    for r in db.data.get("reports", []):
        if r["report_id"] == payload.incident_id:
            r["assigned_team"] = payload.assigned_team
            r["status"] = "assigned"
            db.save()
            log_audit(payload.assigned_by, "forest_officer", "INCIDENT_ASSIGNED", payload.incident_id, f"Assigned to {payload.assigned_team}")
            return {"status": "assigned", "incident": r}
    raise HTTPException(status_code=404, detail="Incident not found")

# --- Alerts Endpoints ---

@app.post("/api/v1/alerts", status_code=status.HTTP_201_CREATED)
def create_alert(alert: AlertCreate):
    alert_id = f"ALT-{datetime.now().strftime('%Y')}-{uuid.uuid4().hex[:5].upper()}"
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(hours=alert.expiry_hours)

    record = {
        "alert_id": alert_id,
        "title": alert.title,
        "alert_type": alert.alert_type,
        "severity": alert.severity.value,
        "area_name": alert.area_name,
        "latitude": alert.latitude,
        "longitude": alert.longitude,
        "radius_km": alert.radius_km,
        "message": alert.message,
        "start_time": now.isoformat(),
        "expiry_time": expiry.isoformat(),
        "is_active": True,
        "is_verified": True,
        "source": alert.source,
        "simulated": alert.simulated
    }

    db.data["alerts"].insert(0, record)
    db.save()
    log_audit("officer", "forest_officer", "ALERT_PUBLISHED", alert_id, f"Published alert: {alert.title}")
    return {"status": "created", "alert": record}

@app.get("/api/v1/alerts")
def list_alerts(only_active: bool = True, include_simulated: bool = True):
    alerts = db.data.get("alerts", [])
    if only_active:
        alerts = [a for a in alerts if a.get("is_active")]
    if not include_simulated:
        alerts = [a for a in alerts if not a.get("simulated")]
    return alerts

@app.put("/api/v1/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    for a in db.data.get("alerts", []):
        if a["alert_id"] == alert_id:
            a["is_active"] = False
            a["resolved_at"] = get_current_iso_time()
            db.save()
            log_audit("officer", "forest_officer", "ALERT_RESOLVED", alert_id, "Alert marked resolved")
            return {"status": "resolved", "alert_id": alert_id}
    raise HTTPException(status_code=404, detail="Alert not found")

# --- Rescue Cases Endpoints ---

@app.post("/api/v1/rescue-cases", status_code=status.HTTP_201_CREATED)
def create_rescue_case(case: RescueCaseCreate):
    rescue_id = f"RESCUE-{datetime.now().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
    now_iso = get_current_iso_time()

    record = {
        "rescue_id": rescue_id,
        "animal_type": case.animal_type,
        "urgency": case.urgency,
        "description": case.description,
        "location_name": case.location_name,
        "latitude": case.latitude,
        "longitude": case.longitude,
        "status": "reported",
        "assigned_team": case.assigned_team,
        "veterinarian_name": case.veterinarian_name,
        "reporter_name": case.reporter_name,
        "reporter_phone": case.reporter_phone,
        "created_at": now_iso,
        "updated_at": now_iso,
        "simulated": False
    }

    db.data["rescue_cases"].insert(0, record)
    db.save()
    log_audit("rescue_team", "vet_rescue", "RESCUE_CREATED", rescue_id, f"Rescue case opened for {case.animal_type}")
    return {"status": "created", "rescue_case": record}

@app.get("/api/v1/rescue-cases")
def list_rescue_cases():
    return db.data.get("rescue_cases", [])

@app.put("/api/v1/rescue-cases/{rescue_id}/status")
def update_rescue_status(rescue_id: str, status: str = Query(...), notes: Optional[str] = None):
    for c in db.data.get("rescue_cases", []):
        if c["rescue_id"] == rescue_id:
            c["status"] = status
            c["updated_at"] = get_current_iso_time()
            if notes:
                c["latest_notes"] = notes
            db.save()
            log_audit("vet_team", "vet_rescue", "RESCUE_STATUS_UPDATE", rescue_id, f"Updated to {status}")
            return {"status": "updated", "rescue_case": c}
    raise HTTPException(status_code=404, detail="Rescue case not found")

# --- Farm Registration Endpoints ---

@app.get("/api/v1/farms")
def list_farms():
    return db.data.get("farms", [])

@app.post("/api/v1/farms", status_code=status.HTTP_201_CREATED)
def register_farm(farm: FarmRegistration):
    farm_id = f"FARM-{datetime.now().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
    record = farm.model_dump()
    record["farm_id"] = farm_id
    db.data["farms"].append(record)
    db.save()
    log_audit(farm.owner_name, "farmer", "FARM_REGISTERED", farm_id, f"Registered farm {farm.farm_name}")
    return {"status": "registered", "farm": record}

# --- Road Zones & Environmental Threats ---

@app.get("/api/v1/road-zones")
def list_road_zones():
    return db.data.get("road_zones", [])

@app.post("/api/v1/road-zones", status_code=status.HTTP_201_CREATED)
def add_road_zone(zone: RoadSafetyZone):
    db.data["road_zones"].append(zone.model_dump())
    db.save()
    return {"status": "added", "zone": zone}

@app.get("/api/v1/environmental-threats")
def list_environmental_threats():
    return db.data.get("environmental_threats", [])

@app.post("/api/v1/environmental-threats", status_code=status.HTTP_201_CREATED)
def create_environmental_threat(threat: EnvironmentalThreatCreate):
    threat_id = f"ENV-{datetime.now().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
    record = {
        "threat_id": threat_id,
        "threat_type": threat.threat_type,
        "severity": threat.severity.value,
        "title": threat.title,
        "description": threat.description,
        "location_name": threat.location_name,
        "latitude": threat.latitude,
        "longitude": threat.longitude,
        "status": "reported",
        "evidence_url": threat.evidence_url,
        "reported_at": get_current_iso_time()
    }
    db.data["environmental_threats"].insert(0, record)
    db.save()
    return {"status": "created", "threat": record}

# --- Analytics Overview ---

@app.get("/api/v1/analytics/overview")
def get_analytics():
    reports = db.data.get("reports", [])
    detections = db.data.get("detections", [])
    alerts = db.data.get("alerts", [])
    rescue = db.data.get("rescue_cases", [])
    devices = db.data.get("devices", [])

    species_counter = {}
    for r in reports:
        sp = r.get("species", "Unknown")
        species_counter[sp] = species_counter.get(sp, 0) + 1

    category_counter = {}
    for r in reports:
        cat = r.get("category", "other")
        category_counter[cat] = category_counter.get(cat, 0) + 1

    return {
        "summary": {
            "total_citizen_reports": len([r for r in reports if not r.get("simulated")]),
            "verified_incidents": len([r for r in reports if r.get("status") in ["verified", "assigned", "response_in_progress", "resolved"]]),
            "thermal_candidate_detections": len([d for d in detections if not d.get("simulated")]),
            "active_alerts": len([a for a in alerts if a.get("is_active")]),
            "active_rescue_cases": len([rc for rc in rescue if rc.get("status") in ["reported", "dispatched", "under_treatment"]]),
            "monitored_devices_online": len([d for d in devices if d.get("status") == "online"]),
            "simulated_demo_events": len([d for d in detections if d.get("simulated")]) + len([r for r in reports if r.get("simulated")])
        },
        "species_distribution": species_counter,
        "incident_categories": category_counter,
        "response_time_avg_minutes": 24.5
    }

# --- Audit Logs & Settings ---

@app.get("/api/v1/audit-logs")
def get_audit_logs(limit: int = 50):
    return db.data.get("audit_logs", [])[:limit]

@app.get("/api/v1/settings")
def get_settings():
    return db.data.get("settings", {})

@app.post("/api/v1/settings")
def update_settings(payload: Dict[str, Any]):
    db.data["settings"].update(payload)
    db.save()
    log_audit("admin", "admin", "SETTINGS_UPDATED", "system_settings", "Updated system settings")
    return {"status": "updated", "settings": db.data["settings"]}

# --- Demo Simulation Endpoints ---

@app.post("/api/v1/demo/simulate-trigger")
def trigger_demo_detection(scenario: str = Query("elephant_highway")):
    scenarios = {
        "elephant_highway": {
            "device_id": "WILDLINK-ROAD-001",
            "possible_species": "Asian Elephant [SIMULATED]",
            "detection_confidence": 0.89,
            "risk_level": RiskLevelEnum.HIGH,
            "max_temp_celsius": 36.8,
            "ambient_temp_celsius": 22.0,
            "latitude": 11.6680,
            "longitude": 76.6310,
            "bounding_boxes": [{"x": 14, "y": 9, "w": 8, "h": 10, "label": "Simulated Large Herbivore"}]
        },
        "wild_boar_farm": {
            "device_id": "WILDLINK-FARM-002",
            "possible_species": "Wild Boar Group [SIMULATED]",
            "detection_confidence": 0.81,
            "risk_level": RiskLevelEnum.MEDIUM,
            "max_temp_celsius": 38.2,
            "ambient_temp_celsius": 21.5,
            "latitude": 11.9850,
            "longitude": 76.0140,
            "bounding_boxes": [{"x": 8, "y": 12, "w": 5, "h": 4, "label": "Simulated Sounder"}]
        },
        "predator_perimeter": {
            "device_id": "WILDLINK-CORRIDOR-003",
            "possible_species": "Candidate Large Carnivore [SIMULATED]",
            "detection_confidence": 0.74,
            "risk_level": RiskLevelEnum.CRITICAL,
            "max_temp_celsius": 37.1,
            "ambient_temp_celsius": 19.8,
            "latitude": 11.9230,
            "longitude": 75.9560,
            "bounding_boxes": [{"x": 10, "y": 11, "w": 6, "h": 5, "label": "Simulated Stalking Profile"}]
        }
    }

    sc = scenarios.get(scenario, scenarios["elephant_highway"])
    now_iso = get_current_iso_time()
    detection_id = f"DET-DEMO-{uuid.uuid4().hex[:6].upper()}"

    det = {
        "detection_id": detection_id,
        "device_id": sc["device_id"],
        "timestamp": now_iso,
        "event_type": "wildlife_detection",
        "detection_method": "thermal",
        "possible_species": sc["possible_species"],
        "detection_confidence": sc["detection_confidence"],
        "candidate_count": 2,
        "risk_level": sc["risk_level"].value,
        "max_temp_celsius": sc["max_temp_celsius"],
        "ambient_temp_celsius": sc["ambient_temp_celsius"],
        "latitude": sc["latitude"],
        "longitude": sc["longitude"],
        "verification_status": "pending",
        "verified_by": None,
        "verification_notes": "Generated by Demo Trigger for testing and validation",
        "assigned_to": None,
        "simulated": True,
        "bounding_boxes": sc["bounding_boxes"]
    }

    db.data["detections"].insert(0, det)
    db.save()
    log_audit("demo_operator", "admin", "DEMO_SIMULATION_TRIGGERED", detection_id, f"Triggered simulated scenario: {scenario}")
    return {"status": "triggered", "scenario": scenario, "detection": det}

@app.post("/api/v1/demo/reset")
def reset_database_to_demo_seed():
    db.reset_to_seed()
    log_audit("admin", "admin", "DATABASE_RESET", "all_collections", "Database reset to initial demo seeds")
    return {"status": "reset", "message": "Database refreshed with clean seed data"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
