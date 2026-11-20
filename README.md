# WILDLINK — Intelligent Wildlife Protection, Human Safety & Conservation Platform

> **Protect Wildlife. Protect People. Preserve Nature.**

WILDLINK is an enterprise-grade full-stack wildlife protection and human–wildlife coexistence platform designed for rural farmers, highway motorists, forest fringe residents, volunteer rescue squads, conservation NGOs, veterinarians, and authorized forest department range officers.

The platform bridges edge IoT hardware (**Raspberry Pi with MLX90640 Far-Infrared Thermal Array**), AI-assisted candidate detection algorithms, REST APIs (**Python / FastAPI**), cloud databases (**Firebase Authentication, Cloud Firestore & Admin SDK**), and a modern geospatial web portal (**React 18, TypeScript, Tailwind CSS, Vite & Leaflet**).

---

## 🌟 Key Features & Functional Modules

1. **Wildlife Safety Map (Dual-Layer Geospatial Architecture)**
   - **Public Mode:** Generalized ~800m privacy offsets to prevent poaching of Schedule I wildlife (elephants, tigers, leopards) while warning communities.
   - **Restricted Officer Mode:** Exact coordinates, hardware sensor posts, rescue logs, and evidence photos visible only to verified forest range officers.
2. **Thermal Camera Edge Monitoring (MLX90640)**
   - 32×24 (768-pixel) far-infrared thermal imaging at 4Hz. Passively detects mammalian body heat in pitch darkness without disturbing animal night vision.
   - Live browser canvas rendering with dynamic false-color temperature scale.
3. **Crop Protection Desk (Farmer Portal)**
   - Farm plot registration with crop tracking (Maize, Coffee, Sugarcane, Banana, Arecanut).
   - Non-lethal humane deterrent guidance (Solar LED flashers, chilli-dung ropes, beehive fencing, bio-acoustic buzzers).
   - Direct integration guidelines for Karnataka *e-Parihara* crop damage relief claims.
4. **Road & Railway Wildlife Safety**
   - Active crossing cautions for highways traversing protected areas (e.g. Bandipur NH-766, Nagarhole SH-33).
   - Speed enforcement advisories and roadkill reporting.
5. **Wildlife Rescue & Veterinary Dispatch**
   - Case logging for injured, entangled, sick, or orphaned wildlife.
   - Rapid dispatch tracking for Mobile Veterinary Units.
6. **City & Village Wildlife Sightings**
   - Public notices for settlements and school perimeters to prevent mob panics.
7. **Environmental Threat Monitoring**
   - Early detection of dry-season forest fires, illegal wire snares, deforestation, and waterhole drying.
8. **Officer Command & Verification Hub**
   - Triage pending citizen submissions, assign field teams, and escalate incidents to public safety alerts.
9. **Admin Console & Immutable Audit Trail**
   - Role-based access control (RBAC), device provisioning, and security audit logging.
10. **Interactive Demo Mode**
    - One-click simulations for elephant highway crossings, wild boar crop intrusions, and predator perimeter alerts.

---

## 📂 Project Structure

```
wildlife/
├── backend/
│   ├── data/
│   │   └── wildlink_db.json        # Persistent JSON database with default seed data
│   ├── .env.example
│   ├── database.py                 # Multi-collection database engine (local JSON + Firestore sync)
│   ├── models.py                   # Pydantic schemas for devices, reports, alerts, rescue cases
│   └── main.py                     # FastAPI REST API endpoints & CORS middleware
├── frontend/
│   ├── dist/                       # Production-built bundle
│   ├── src/
│   │   ├── components/             # Navbar, Footer, DemoControlBar, LeafletMap
│   │   ├── context/                # AuthContext (with 1-click role switcher), AlertContext
│   │   ├── pages/                  # 17 responsive pages covering all modules
│   │   ├── services/               # Centralized API service layer
│   │   ├── types/                  # TypeScript interfaces
│   │   ├── App.tsx                 # Full route definitions
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts              # Vite dev server with /api proxy to port 8000
├── hardware/
│   ├── README.md                   # Raspberry Pi wiring pinouts & I2C setup guide
│   ├── requirements.txt            # Python edge dependencies
│   ├── config.example.yaml         # Edge node parameters & API URLs
│   ├── thermal_camera.py           # MLX90640 I2C sensor acquisition & simulation engine
│   ├── camera.py                   # OpenCV RGB camera driver with test patterns
│   ├── thermal_processing.py       # Heat clustering, ambient calculation & bounding boxes
│   ├── animal_detection.py         # Interchangeable candidate detection & AI pipeline
│   ├── send_detection.py           # Secure transmission with auth headers & retries
│   ├── device_health.py            # CPU, RAM, battery/solar telemetry
│   ├── main.py                     # Operational daemon loop with CLI flags
│   └── wildlink-sensor.service     # Linux systemd autostart unit file
├── firestore.rules                 # Security rules for Cloud Firestore
├── firestore.indexes.json          # Composite indexes configuration
├── run_backend.bat                 # One-click Windows runner for FastAPI
├── run_frontend.bat                # One-click Windows runner for Vite UI
├── run_simulation.bat              # One-click Windows runner for Edge IoT Node
├── README.md
├── SETUP.md
├── HARDWARE_SETUP.md
├── FIREBASE_SETUP.md
├── API_DOCUMENTATION.md
├── DEPLOYMENT.md
└── SECURITY.md
```

---

## 🚀 Quick Start (Local Execution)

### Step 1: Start Backend (Port 8000)
```bash
# In project root:
python backend/main.py
# Or run: .\run_backend.bat
```
*API docs available at: `http://localhost:8000/docs`*

### Step 2: Start Frontend (Port 5173)
```bash
cd frontend
npm run dev
# Or run: .\run_frontend.bat
```
*Open `http://localhost:5173` in your browser.*

### Step 3: Run Sensor Node in Simulation Mode
```bash
python hardware/main.py --simulate --base-url http://localhost:8000
# Or run: .\run_simulation.bat
```
