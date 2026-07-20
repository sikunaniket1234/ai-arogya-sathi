# AI Arogya Sathi — User Credentials

## Demo Accounts

| Name | Email | Password | Age | Blood Group | Conditions | Allergies | Language |
|------|-------|----------|-----|-------------|------------|-----------|----------|
| Rajesh Kumar | rajesh@demo.com | demo123 | 48 | B+ | None known | None known | English |
| Priya Sharma | priya@demo.com | demo123 | 22 | O+ | None known | Pollen | Hindi |
| Savitri Devi | savitri@demo.com | demo123 | 67 | A+ | High blood pressure, Diabetes | Penicillin | Hindi |

## Service Ports

| Service | URL | Port |
|---------|-----|------|
| Frontend (Angular) | http://localhost:4201 | 4201 |
| Backend API | http://localhost:3000 | 3000 |
| Nginx Proxy | http://localhost:8080 | 8080 |
| PostgreSQL | localhost:5433 | 5433 |
| Redis | localhost:6379 | 6379 |

## Database Credentials

| Parameter | Value |
|-----------|-------|
| DB User | arogya |
| DB Password | arogya_secret |
| DB Name | arogya_sathi |
| JWT Secret | change-this-in-production |

## Docker Commands

```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Seed demo users
docker-compose exec backend node src/database/seed.js
```

## API Endpoints

### Public
- `POST /api/auth/register` — Create new account
- `POST /api/auth/login` — Sign in

### Protected (requires Bearer token)
- `GET /api/profiles` — List family profiles
- `POST /api/profiles` — Create profile
- `PUT /api/profiles/:id` — Update profile
- `DELETE /api/profiles/:id` — Delete profile
- `GET /api/health-records/:profileId` — Get vitals
- `POST /api/health-records/:profileId` — Record vitals
- `GET /api/medicines/:profileId` — Get medicines
- `POST /api/medicines/:profileId` — Add medicine
- `PUT /api/medicines/:id` — Update medicine
- `DELETE /api/medicines/:id` — Delete medicine
- `GET /api/symptoms/:profileId` — Symptom history
- `POST /api/symptoms/:profileId` — Submit symptom query
- `GET /api/reminders/active/:profileId` — Active medicines
- `POST /api/reminders/take/:medicineId` — Mark dose taken
- `GET /api/reminders/adherence/:profileId` — Adherence stats
- `GET /api/emergency` — Emergency contacts
- `GET /api/emergency/first-aid` — First aid guide
- `GET /api/devices/supported` — Supported devices
- `POST /api/devices/sync/:profileId` — Sync device data
- `POST /api/devices/upload/:profileId` — Upload CSV
- `GET /api/trends/vitals/:profileId` — Vital trends
- `GET /api/trends/health-score/:profileId` — Health score
- `GET /api/notifications` — List notifications
- `POST /api/notifications/:id/read` — Mark notification read
