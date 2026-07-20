# AI Arogya Sathi — Development History

## Project Timeline

### Phase 1 — Prototype Foundation (Completed)
**Date:** July 2026

**Objectives:**
- Convert exhibition prototype into modular architecture
- Set up Docker-based development environment

**Deliverables:**
- Angular 17 frontend with routing and guards
- Node.js + Express backend with REST API
- PostgreSQL database schema (6 tables)
- Docker Compose orchestration (5 services)
- JWT authentication system

**Files Created:**
- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `backend/src/index.js`
- `backend/src/config/database.js`
- `backend/src/middleware/auth.js`
- `backend/src/database/init.sql`
- `backend/src/routes/auth.js`
- `backend/src/routes/profiles.js`

---

### Phase 2 — Backend and Data Layer (Completed)
**Date:** July 2026

**Objectives:**
- Implement full CRUD APIs
- Add authentication and profile management

**Deliverables:**
- User registration and login with bcrypt + JWT
- Family profile CRUD operations
- Health records API
- Medicine records API
- Input validation with express-validator

**Files Created:**
- `backend/src/routes/health.js`
- `backend/src/routes/medicines.js`
- `backend/src/routes/symptoms.js`
- `frontend/src/app/services/auth.service.ts`
- `frontend/src/app/services/api.service.ts`
- `frontend/src/app/guards/auth.guard.ts`
- `frontend/src/app/pages/login/`
- `frontend/src/app/pages/register/`
- `frontend/src/app/pages/dashboard/`
- `frontend/src/app/pages/profiles/`

---

### Phase 3 — AI and Guidance Engine (Completed)
**Date:** July 2026

**Objectives:**
- Replace static demo responses with intelligent guidance
- Add safety rules and escalation logic
- Implement multilingual support

**Deliverables:**
- Knowledge base with 5 common symptoms (EN + HI)
- Safety engine with risk scoring and escalation
- AI reasoning pipeline
- Medicine reminder service with adherence tracking
- Emergency support module with offline first-aid
- Health dashboard with vitals recording

**Files Created:**
- `backend/src/services/knowledgeBase.js`
- `backend/src/services/safetyEngine.js`
- `backend/src/services/aiReasoning.js`
- `backend/src/services/reminderService.js`
- `backend/src/services/emergencyService.js`
- `backend/src/routes/reminders.js`
- `backend/src/routes/emergency.js`
- `frontend/src/app/pages/reminders/`
- `frontend/src/app/pages/emergency/`
- `frontend/src/app/pages/health-dashboard/`

---

### Phase 4 — Health Data and Integrations (Completed)
**Date:** July 2026

**Objectives:**
- Connect wearable and device data sources
- Add health trend analytics
- Implement notification system

**Deliverables:**
- Device integration API (6 device types)
- CSV data import endpoint
- Health trend analytics service
- Health score calculation
- Notification service with scheduler
- Trends visualization page

**Files Created:**
- `backend/src/routes/devices.js`
- `backend/src/routes/trends.js`
- `backend/src/routes/notifications.js`
- `backend/src/services/trendService.js`
- `backend/src/services/notificationService.js`
- `frontend/src/app/pages/trends/`

---

### Phase 5 — Production Readiness (Completed)
**Date:** July 2026

**Objectives:**
- Harden security and privacy controls
- Add monitoring and logging
- Optimize for deployment

**Deliverables:**
- Rate limiting (API, auth, symptom endpoints)
- Input sanitization against XSS
- Security headers (CSP, X-Frame-Options, etc.)
- Structured JSON logging
- Health check and readiness probes
- Nginx reverse proxy configuration
- Graceful shutdown handling

**Files Created:**
- `backend/src/middleware/security.js`
- `backend/src/utils/logger.js`
- `nginx/nginx.conf`

---

### Landing Page (Completed)
**Date:** July 2026

**Objectives:**
- Create marketing landing page matching prototype design
- Dark theme with marigold accents

**Deliverables:**
- Full landing page with 10 sections
- Animated ECG pulse strip
- Persona cards (Rajesh, Priya, Savitri Devi)
- Module showcase with expandable cards
- AI engine flow diagram
- Architecture visualization
- Roadmap with 5 phases
- Scroll-reveal animations

**Files Created:**
- `frontend/src/app/pages/landing/landing.component.ts`

---

### Wearable Device Integration (Completed)
**Date:** July 2026

**Objectives:**
- Connect real wearable devices to the app
- Support Bluetooth Low Energy (BLE) health devices
- Integrate with Google Fit for health data sync
- Provide simulated device mode for testing

**Deliverables:**

#### Web Bluetooth (BLE) Service
- Real-time vital sign streaming from BLE devices
- Support for heart rate, blood pressure, temperature, SpO2
- Automatic service discovery and characteristic subscription
- Device connection management with disconnect handling

#### Google Fit Integration
- OAuth2 authentication flow
- Heart rate data retrieval
- Step count history
- Sleep tracking data
- Connected status management

#### Simulated Device Mode
- Realistic vital sign generation with natural variation
- Heart rate, blood pressure, oxygen, temperature simulation
- Configurable baseline values
- Start/stop controls for testing

#### Device Management UI
- Three connection methods (BLE, Google Fit, Simulated)
- Live vital stream display
- Supported device catalog
- Connection status indicators

**Files Created:**
- `frontend/src/app/services/bluetooth.service.ts`
- `frontend/src/app/services/google-fit.service.ts`
- `frontend/src/app/services/simulated-device.service.ts`
- `frontend/src/app/pages/devices/devices.component.ts`

**Supported BLE Devices:**
| Device Type | Data Provided | Bluetooth Service |
|-------------|--------------|-------------------|
| Pulse Oximeter | Heart Rate, SpO2 | `heart_rate`, `pulse_oximeter` |
| BP Monitor | Systolic, Diastolic | `blood_pressure` |
| Thermometer | Temperature | `health_thermometer` |
| Fitness Band | Heart Rate, Steps | `heart_rate` |

**How It Works:**
```
BLE Device → Web Bluetooth API → Angular Service → Live Dashboard
Google Fit → OAuth2 API → Angular Service → Health Dashboard
Simulated → JS Timer → Angular Service → Live Stream
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, TypeScript, SCSS |
| Backend | Node.js 20, Express 4, bcryptjs, jsonwebtoken |
| Database | PostgreSQL 16, Redis 7 |
| Infrastructure | Docker Compose, Nginx Alpine |
| Security | Helmet, CORS, rate-limiting, input sanitization |
| Wearables | Web Bluetooth API, Google Fit OAuth2, Simulated Device |

## Database Schema

| Table | Purpose |
|-------|---------|
| users | User accounts with auth |
| family_profiles | Family member profiles |
| health_records | Vitals and health data |
| medicine_records | Medicine schedules |
| symptom_queries | Symptom query history |
| response_logs | AI response history |

## API Statistics

- **11 route groups**
- **35+ API endpoints**
- **7 backend services**
- **3 wearable services** (BLE, Google Fit, Simulated)
- **10 frontend pages**
- **5 Docker containers**

## File Count

| Category | Files |
|----------|-------|
| Backend Routes | 11 |
| Backend Services | 7 |
| Frontend Pages | 10 |
| Frontend Services | 5 |
| Config/Docker | 6 |
| Documentation | 4 |
| **Total** | **43** |
