# System Components

## Frontend Components
### Mobile App
- React Native or Flutter
- Handles user interaction, dashboards, reminders, and emergency mode

### Web App
- React or Next.js
- Useful for demos, admin workflows, and testing

### Local Client Storage
- SQLite or IndexedDB for offline data
- Caches profiles, reminders, and recent responses

## Backend Components
### Authentication Service
- User registration and login
- Session management
- Token-based access control

### Profile Service
- Family profile management
- Health data and alert settings

### Guidance Service
- Symptom intake and interpretation
- AI response orchestration
- Safety checks and escalation

### Reminder Service
- Medicine schedule management
- Notification triggering
- Adherence tracking

### Emergency Service
- Emergency contacts
- SOS workflow
- Nearby hospital information
- Offline first-aid guidance

## Data Components
- PostgreSQL for core structured data
- Redis for cache and queue support
- Object storage for attachments or media

## AI Components
- LLM inference service
- Retrieval layer over trusted knowledge base
- Safety policy engine
- Local fallback rules for offline operation
