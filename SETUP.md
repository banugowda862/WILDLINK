# WILDLINK — Installation & Local Setup Guide

This guide covers installing dependencies, configuring environment variables, running the frontend and backend locally, and validating system endpoints.

---

## Prerequisites

1. **Node.js**: Version 20.x or higher (LTS recommended)
2. **Python**: Version 3.10 to 3.13
3. **Git**

---

## 1. Backend Setup (FastAPI)

1. **Verify Python packages**:
   ```bash
   pip install fastapi uvicorn pydantic pyyaml requests python-multipart
   ```
2. **Configure Environment Variables (Optional)**:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. **Launch the Backend API Server**:
   ```bash
   python main.py
   ```
   The backend will start at: `http://localhost:8000`
   - Interactive Swagger API Documentation: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/api/v1/health`

---

## 2. Frontend Setup (React + Vite + Tailwind)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Launch the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in any modern web browser.
   Vite is preconfigured to proxy `/api/*` requests directly to `http://localhost:8000`.

---

## 3. IoT Edge Sensor Simulation

To simulate a live Raspberry Pi MLX90640 thermal sensor transmitting telemetry and detected wildlife events into the live platform:

```bash
cd hardware
python main.py --simulate --base-url http://localhost:8000
```

Watch the terminal logs as the simulated sensor:
1. Emits periodic telemetry heartbeats (`POST /api/v1/devices/heartbeat`)
2. Evaluates 32×24 thermal heat frames
3. Identifies candidate heat clusters (e.g. 36.5°C mammalian profile)
4. Transmits structured detections to `POST /api/v1/detections`

---

## 4. One-Click Convenience Launchers

For Windows users, root batch files are provided:
- `.\run_backend.bat` — Starts the FastAPI backend
- `.\run_frontend.bat` — Starts the Vite React frontend
- `.\run_simulation.bat` — Starts the IoT Edge Sensor node in simulation mode
