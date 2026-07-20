# AI Arogya Sathi — Phase 14 + 15: QR Medical Card & Community/Government

## Overview

**Phase 14 — QR Medical Card**
Generate a scannable QR code containing a person's medical profile (name, age, blood group, conditions, allergies, current meds, emergency contact). Includes a printable medical card layout. Scanned by any phone camera → shows life-saving info in emergencies.

**Phase 15 — Community & Government**
Community health hub with government health scheme eligibility checker, blood bank locator, vaccination camp finder, outbreak alert banner, and community health worker dashboard.

---

## Database Changes

| Table | Change |
|-------|--------|
| `family_profiles` | Add `medical_card_token` (UUID, unique) — stable QR identifier that doesn't expose the profile UUID |
| New: `community_schemes` | `id`, `name`, `description`, `eligibility_criteria` (JSONB), `scheme_type` (insurance/subsidy/free_treatment/screening), `provider` (central/state), `link`, `states` (TEXT[]), `is_active` |
| New: `blood_banks` | `id`, `name`, `address`, `city`, `state`, `phone`, `blood_available` (TEXT[]), `lat`, `lng`, `last_updated` |
| New: `vaccination_camps` | `id`, `name`, `address`, `city`, `state`, `date`, `vaccines` (TEXT[]), `age_group`, `is_free`, `registration_link` |
| New: `outbreak_alerts` | `id`, `disease`, `region`, `severity` (low/medium/high/critical), `message`, `source`, `starts_at`, `ends_at`, `is_active` |

---

## Backend

### New Files

| File | Purpose |
|------|---------|
| `routes/medicalCard.js` | `GET /api/medical-card/:profileId` — returns JSON medical profile for QR; `GET /api/medical-card/:profileId/qr` — returns QR code as PNG via `qrcode` package |
| `routes/community.js` | `GET /schemes` (with `?state=&age=&condition=` filters), `GET /schemes/:id`, `GET /blood-banks` (with `?city=&blood_type=`), `GET /blood-banks/nearby` (lat/lng), `GET /vaccination-camps` (with `?city=&vaccine=`), `GET /outbreaks` (active alerts by state) |
| `seedCommunity.js` | Seed script: 15+ government health schemes (Ayushman Bharat, Janani Suraksha, etc.), 10 blood banks, 5 vaccination camps, 3 outbreak alerts — all India-specific realistic data |

### Modified Files

| File | Change |
|------|--------|
| `index.js` | Mount `/api/medical-card` and `/api/community` routes |
| `database/init.sql` | Add `medical_card_token` column to `family_profiles`, create 4 new tables |
| `middleware/auth.js` | Allow QR endpoint to work with a signed token (no login required for scanning) |

---

## Frontend

### New Components

| Component | Route | Purpose |
|-----------|-------|---------|
| `MedicalCardComponent` | `/medical-card/:profileId` | QR code display (via `angularx-qrcode`), printable card layout with blood group, conditions, allergies, meds, emergency contact. Public route (no auth) — accessed by scanning QR |
| `MedicalCardPrintComponent` | `/medical-card/:profileId/print` | Clean print-optimized view: wallet-sized card, name, blood group (large), conditions list, emergency number |
| `CommunityComponent` | `/community` | Tabbed page: Health Schemes, Blood Banks, Vaccination Camps, Outbreak Alerts |
| `HealthSchemeDetailComponent` | `/community/scheme/:id` | Scheme details with eligibility check form (enter age, state, condition → "You may be eligible") |

### Modified Files

| File | Change |
|------|--------|
| `app.routes.ts` | Add 4 new routes |
| `api.service.ts` | Add medical card + community API methods |
| `profiles.component.ts` | Add "Generate Medical Card" button per profile → navigates to card page |

---

## Libraries to Install

**Backend:** `qrcode` (QR generation)
**Frontend:** `angularx-qrcode` (Angular QR component)

---

## QR Code Data Format

The QR code encodes a JSON object with the following structure:

```json
{
  "v": 1,
  "token": "stable-uuid",
  "name": "Savitri Devi",
  "age": 65,
  "blood": "B+",
  "gender": "female",
  "conditions": ["Diabetes", "High Blood Pressure"],
  "allergies": ["Penicillin"],
  "medications": ["Metformin 500mg", "Amlodipine 5mg"],
  "emergency": { "name": "Rajesh Kumar", "phone": "+91-98765-43210" }
}
```

Scanning with any phone camera shows this info in a clean readable format.

---

## Seed Data Examples

### Health Schemes
- Ayushman Bharat (PMJAY)
- Janani Suraksha Yojana
- Rashtriya Swasthya Bima Yojana
- Pradhan Mantri Jan Aushadhi
- National Digital Health Mission
- TB Elimination Program
- National Programme for Prevention and Control of Cancer, Diabetes, CVD and Stroke

### Blood Banks
Realistic names/addresses for major Indian cities

### Outbreak Alerts
- Dengue in Delhi (medium severity)
- Cholera in Mumbai (low severity)
- Malaria in rural UP (high severity)

---

## Verification

1. `docker-compose exec frontend npx ng build --configuration=production` — must pass
2. `docker-compose exec backend node src/database/seedCommunity.js` — seed community data
3. Create a profile → generate QR → scan with phone camera → see medical info
4. Visit `/community` → browse schemes by state, blood banks by city, see outbreak alerts
5. Eligibility checker: enter age + state + condition → match relevant schemes
