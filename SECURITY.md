# WILDLINK — Security, Anti-Poaching Privacy & Ethical Governance

WILDLINK operates at the intersection of public safety and endangered species conservation.
Security in this domain requires preventing bad actors from exploiting wildlife location telemetry.

---

## 1. Anti-Poaching Geospatial Privacy Architecture

Poaching of Asian Elephants (*Elephas maximus*) and Bengal Tigers (*Panthera tigris*) is severely facilitated if precise GPS coordinates of animal sightings are broadcast publicly.

### Spatial Coordinate Masking
- **Public Map View**: All citizen reports and active safety warnings pass through a deterministic spatial jitter algorithm that introduces an artificial offset of 500 to 800 meters.
- **Restricted Officer Map View**: Only users possessing verified `forest_officer` or `admin` custom claims / roles can decrypt or view exact GPS coordinates, sensor installation posts, and evidence media.
- **Anti-Scraping Rate Limiting**: The backend enforces rate limits on map marker queries to prevent programmatic harvesting of animal movements.

---

## 2. IoT Edge Device Security

- **Per-Device Secrets**: Every Raspberry Pi sentinel possesses a distinct `secret_token` provisioned during registration. Devices authenticate using the `X-Device-Token` header.
- **No Direct Database Writes**: Edge hardware communicates exclusively through validated FastAPI endpoints (`POST /api/v1/detections`). Direct writes to Firestore from IoT nodes are blocked by security rules.
- **Physical Sandboxing**: Edge devices run on restricted non-root accounts with `systemd` isolation:
  ```ini
  ProtectSystem=full
  ProtectHome=read-only
  ```

---

## 3. Human-in-the-Loop AI Verification

- **Low-Resolution Array Limitations**: The MLX90640 produces a 32×24 thermal array (768 total pixels). While sufficient to isolate a mammalian heat cluster against ambient forest flora, it cannot independently guarantee species classification.
- **Candidate Tagging**: Detections are labeled strictly as *candidates* (e.g. `Asian Elephant (Candidate)`).
- **Mandatory Officer Verification**: No public danger sirens or wide highway advisories are broadcast until a verified Range Officer confirms the sighting.
- **No Autonomous Lethal or Capture Decisions**: AI models are forbidden from authorizing physical animal interventions, trapping, or tranquilization.

---

## 4. Immutable Audit Trail

All administrative and verification actions are logged in the `auditLogs` collection:
- Incident verifications and rejections
- Squad dispatch assignments
- Device registration and token rotations
- Emergency alert publications and resolutions
Logs record actor UID, role, timestamp, action, target entity, and IP address.
