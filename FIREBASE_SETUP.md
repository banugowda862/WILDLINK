# WILDLINK — Firebase Setup & Security Architecture Guide

WILDLINK is designed with a dual-mode database architecture:
1. **Out-of-the-Box Local Mode:** Operates immediately with zero external credentials using persistent JSON collections (`backend/data/wildlink_db.json`) and mock authentication for friction-free local evaluation.
2. **Production Cloud Mode:** Connects to **Firebase Authentication**, **Cloud Firestore**, **Firebase Storage**, and **Firebase Admin SDK**.

---

## 1. Creating the Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/) and create a new project named `wildlink-coexistence`.
2. Enable **Authentication**:
   - Enable **Email/Password** sign-in provider.
3. Enable **Cloud Firestore**:
   - Choose production mode.
   - Select your target region (e.g. `asia-south1` for India / Western Ghats deployment).
4. Enable **Firebase Storage**:
   - Creates a default bucket (`wildlink-coexistence.appspot.com`) for citizen photographic evidence uploads.

---

## 2. Firestore Data Collections Model

WILDLINK organizes data into 8 collections with schema validation:

| Collection Name | Document Key | Primary Fields |
|-----------------|--------------|----------------|
| `users` | `uid` | `email`, `displayName`, `role`, `organization`, `phone`, `createdAt` |
| `devices` | `deviceId` | `name`, `installationArea`, `latitude`, `longitude`, `status`, `batteryLevel`, `lastHeartbeat` |
| `detections` | `detectionId` | `deviceId`, `timestamp`, `possibleSpecies`, `detectionConfidence`, `riskLevel`, `maxTempCelsius`, `verificationStatus` |
| `reports` | `reportId` | `category`, `title`, `description`, `locationName`, `latitude`, `longitude`, `species`, `severity`, `status`, `assignedTeam` |
| `alerts` | `alertId` | `title`, `alertType`, `severity`, `areaName`, `radiusKm`, `message`, `startTime`, `expiryTime`, `isActive` |
| `rescueCases` | `rescueId` | `animalType`, `urgency`, `locationName`, `status`, `assignedTeam`, `veterinarianName` |
| `farms` | `farmId` | `ownerId`, `farmName`, `sizeAcres`, `crops`, `primaryThreats` |
| `auditLogs` | `logId` | `timestamp`, `actorEmail`, `actorRole`, `action`, `target`, `details`, `ipAddress` |

---

## 3. Deploying Firestore Rules & Indexes

The project includes `firestore.rules` and `firestore.indexes.json` at the root.

Install the Firebase CLI and deploy:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 4. Backend Service Account Configuration

1. In Firebase Console, open **Project Settings** -> **Service accounts**.
2. Click **Generate new private key** and download the JSON file.
3. Place this file inside the `backend/` directory as `serviceAccountKey.json`.
4. In `backend/.env`, set:
   ```env
   FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
   FIREBASE_STORAGE_BUCKET=wildlink-coexistence.appspot.com
   ```

---

## 5. Frontend Client SDK Configuration

In `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=wildlink-coexistence.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wildlink-coexistence
VITE_FIREBASE_STORAGE_BUCKET=wildlink-coexistence.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
