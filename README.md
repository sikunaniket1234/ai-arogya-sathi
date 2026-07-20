# AI Arogya Sathi

Offline-first, multilingual health companion for Indian families.

## Tech Stack
- **Frontend**: Angular 17
- **Backend**: Node.js + Express
- **Database**: PostgreSQL 16 + Redis 7
- **Infrastructure**: Docker Compose

## Quick Start

### Prerequisites
- Docker & Docker Compose installed

### Run the Application
```bash
docker-compose up --build
```

### Access
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432 (user: arogya, pass: arogya_secret)
- **Redis**: localhost:6379

### API Endpoints

#### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

#### Profiles (requires Bearer token)
- `GET /api/profiles` - List family profiles
- `POST /api/profiles` - Create profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

#### Health Records
- `GET /api/health-records/:profileId` - Get health records
- `POST /api/health-records/:profileId` - Add health record

#### Medicines
- `GET /api/medicines/:profileId` - Get medicines
- `POST /api/medicines/:profileId` - Add medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

#### Symptoms
- `GET /api/symptoms/:profileId` - Get symptom history
- `POST /api/symptoms/:profileId` - Submit symptom query

## Project Structure
```
ai_arogya_sathi/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/database.js
│       ├── middleware/auth.js
│       ├── database/init.sql
│       └── routes/
│           ├── auth.js
│           ├── profiles.js
│           ├── health.js
│           ├── medicines.js
│           └── symptoms.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── angular.json
│   └── src/
│       ├── app/
│       │   ├── app.component.ts
│       │   ├── app.config.ts
│       │   ├── app.routes.ts
│       │   ├── guards/auth.guard.ts
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   └── api.service.ts
│       │   └── pages/
│       │       ├── login/
│       │       ├── register/
│       │       ├── dashboard/
│       │       ├── profiles/
│       │       └── symptom/
│       ├── styles.scss
│       └── index.html
└── docs/
```

## Next Steps (Phase 3+)
- Integrate AI reasoning service for symptom guidance
- Add knowledge retrieval from trusted medical sources
- Implement medicine reminder notifications
- Connect wearable/device data sources
- Add offline-first capabilities with service workers
