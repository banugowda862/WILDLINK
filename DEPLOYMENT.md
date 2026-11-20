# WILDLINK — Production Cloud Deployment Guide

This guide covers deploying the WILDLINK application across production cloud infrastructure:
- **Frontend**: Vercel, Firebase Hosting, or Cloudflare Pages
- **Backend API**: Google Cloud Run, AWS ECS, or Render with HTTPS
- **IoT Fleet**: BalenaCloud or Systemd for Raspberry Pi sentinels

---

## 1. Frontend Deployment (Vercel / Firebase Hosting)

### Option A: Vercel
1. Install the Vercel CLI or connect your Git repository:
   ```bash
   cd frontend
   npx vercel
   ```
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. In Project Settings -> Environment Variables, configure:
   ```
   VITE_API_BASE_URL=https://api.wildlink.yourdomain.org/api/v1
   ```

### Option B: Firebase Hosting
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Initialize and deploy:
   ```bash
   firebase init hosting
   # Specify 'dist' as the public directory and configure single-page app (Yes)
   firebase deploy --only hosting
   ```

---

## 2. Backend Deployment (Google Cloud Run / Docker)

### Dockerfile (`backend/Dockerfile`):
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Deploy to Google Cloud Run:
```bash
gcloud builds submit --tag gcr.io/wildlink-coexistence/api backend/
gcloud run deploy wildlink-api \
  --image gcr.io/wildlink-coexistence/api \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars ENVIRONMENT=production,DEMO_MODE=false
```

---

## 3. Production HTTPS & CORS Configuration

In `backend/.env` on your production cloud host:
```env
CORS_ORIGINS=https://wildlink.yourdomain.org
PORT=8000
DEMO_MODE=false
```
All API communication must take place over TLS/HTTPS (port 443) to prevent sniffing of device tokens or officer authentication sessions.
