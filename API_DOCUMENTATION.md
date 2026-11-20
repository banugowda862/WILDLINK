# WILDLINK — REST API Reference (v1.2.0)

Base URL: `http://localhost:8000/api/v1`  
Interactive Swagger Docs: `http://localhost:8000/docs`  
OpenAPI Specification: `http://localhost:8000/openapi.json`

---

## 1. System Health & Telemetry

### `GET /api/v1/health`
Checks backend service availability, database status, and active alert counts.
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "WILDLINK Core API",
  "version": "1.2.0",
  "timestamp": "2026-11-20T21:45:00Z",
  "database": "online",
  "demo_mode": true,
  "devices_count": 4,
  "active_alerts_count": 2,
  "firebase_configured": false
}
```

---

## 2. IoT Device Registration & Heartbeats

### `POST /api/v1/devices/register`
Registers a new edge monitoring device.
- **Request Body**:
```json
{
  "device_id": "WILDLINK-ROAD-005",
  "name": "Nagarhole South River Crossing",
  "installation_area": "Bavali River Forest Edge",
  "device_type": "thermal_mlx90640_rgb",
  "latitude": 11.9120,
  "longitude": 76.1450,
  "secret_token": "dev-token-9988",
  "software_version": "v1.2.0"
}
```

### `POST /api/v1/devices/heartbeat`
Edge sentry node transmits continuous telemetry metrics.
- **Headers**: `X-Device-Token: <token>`
- **Request Body**:
```json
{
  "device_id": "WILDLINK-ROAD-001",
  "battery_level": 92.4,
  "solar_charging": true,
  "cpu_usage": 14.2,
  "memory_usage": 28.5,
  "temp_celsius": 38.1,
  "thermal_status": "healthy",
  "rgb_camera_status": "connected"
}
```

### `GET /api/v1/devices/status`
Returns high-level fleet availability metrics and device listings.

---

## 3. Wildlife Detections

### `POST /api/v1/detections`
Transmits candidate detection event from thermal processing pipeline.
- **Headers**: `X-Device-Token: <token>`
- **Request Body**:
```json
{
  "device_id": "WILDLINK-ROAD-001",
  "event_type": "wildlife_detection",
  "detection_method": "thermal",
  "possible_species": "Asian Elephant (Candidate)",
  "detection_confidence": 0.88,
  "candidate_count": 2,
  "risk_level": "high",
  "max_temp_celsius": 36.5,
  "ambient_temp_celsius": 22.1,
  "latitude": 11.6664,
  "longitude": 76.6291,
  "verification_status": "pending",
  "bounding_boxes": [
    { "x": 12, "y": 8, "w": 8, "h": 10, "label": "Candidate Heat Source" }
  ],
  "simulated": false
}
```

### `GET /api/v1/detections`
Lists recent candidate detection events. Supports `?include_simulated=true|false`.

---

## 4. Reports & Incident Verification

### `POST /api/v1/reports`
Citizen submission for sightings, damage, or distress.
- **Request Body**:
```json
{
  "category": "wildlife_road_crossing",
  "title": "Elephant crossing NH-766 at Km 24",
  "description": "3 elephants visible from roadway grazing 100m away.",
  "location_name": "Bandipur Highway Km 24",
  "latitude": 11.6664,
  "longitude": 76.6291,
  "species": "Asian Elephant",
  "severity": "high",
  "reporter_name": "Rajesh Gowda",
  "reporter_contact": "+91 98451 00000",
  "reporter_role": "driver",
  "is_public": true,
  "privacy_consent": true
}
```

### `POST /api/v1/incidents/verify`
Authorized Forest Range Officer verifies or rejects an incident.
- **Request Body**:
```json
{
  "incident_id": "REP-2026-8801",
  "verified": true,
  "verified_by": "Officer M. Deshmukh",
  "officer_notes": "Confirmed by Moolehole anti-poaching watcher.",
  "escalate_to_alert": true,
  "alert_severity": "warning",
  "alert_message": "Elephant activity confirmed near Km 24. Reduce vehicle speed."
}
```

---

## 5. Alerts & Emergency Advisories

### `GET /api/v1/alerts`
Returns active public safety alerts with coverage radius and expiry timestamps.

### `PUT /api/v1/alerts/{alert_id}/resolve`
Closes an alert after field teams verify wildlife has retreated into deep core forest.

---

## 6. Rescue Operations

### `POST /api/v1/rescue-cases`
Logs an injured, sick, or trapped animal requiring urgent rescue.

### `PUT /api/v1/rescue-cases/{rescue_id}/status`
Updates rescue progression: `reported` -> `dispatched` -> `under_treatment` -> `rehabilitating` -> `released`.

---

## 7. Demo Simulation Triggers

### `POST /api/v1/demo/simulate-trigger?scenario=elephant_highway|wild_boar_farm|predator_perimeter`
Instantly triggers a simulated thermal sensor detection for evaluation.

### `POST /api/v1/demo/reset`
Resets the persistent local database to clean default seed scenarios.
