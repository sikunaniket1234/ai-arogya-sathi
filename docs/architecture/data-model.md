# Data Model Plan

## Core Entities
### User
- id
- name
- email or phone
- language preference
- created_at

### Family Profile
- id
- user_id
- name
- age
- blood_group
- conditions
- allergies
- emergency_contact
- profile_photo_url

### Health Record
- id
- profile_id
- heart_rate
- blood_pressure
- oxygen_level
- temperature
- sleep_hours
- timestamp

### Medicine Record
- id
- profile_id
- medicine_name
- dosage
- schedule_time
- status
- taken_at

### Symptom Query
- id
- profile_id
- input_text
- input_mode
- language
- created_at

### Response Log
- id
- symptom_query_id
- response_content
- safety_score
- escalation_flag
- source

## Notes
- Sensitive records should be encrypted at rest.
- Local device storage should mirror core profile and reminder data.
- Data versioning should be used for future sync conflicts.
