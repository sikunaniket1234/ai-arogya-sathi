CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  dob DATE,
  gender VARCHAR(20),
  aadhaar_last4 VARCHAR(4),
  address_state VARCHAR(100),
  address_district VARCHAR(100),
  address_pin VARCHAR(6),
  blood_group VARCHAR(5),
  language_preference VARCHAR(10) DEFAULT 'en',
  role VARCHAR(20) DEFAULT 'user',
  abha_created_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE family_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  blood_group VARCHAR(5),
  gender VARCHAR(20),
  conditions TEXT[],
  allergies TEXT[],
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  medical_card_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  profile_photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES family_profiles(id) ON DELETE CASCADE,
  heart_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  oxygen_level INTEGER,
  temperature DECIMAL(4,1),
  sleep_hours DECIMAL(3,1),
  steps INTEGER,
  device_type VARCHAR(50),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicine_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES family_profiles(id) ON DELETE CASCADE,
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  schedule_time TIME,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE symptom_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES family_profiles(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  input_mode VARCHAR(20) DEFAULT 'text',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE response_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID NOT NULL REFERENCES symptom_queries(id) ON DELETE CASCADE,
  response_content TEXT NOT NULL,
  safety_score DECIMAL(3,2),
  escalation_flag BOOLEAN DEFAULT FALSE,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_family_profiles_user ON family_profiles(user_id);
CREATE INDEX idx_health_records_profile ON health_records(profile_id);
CREATE INDEX idx_medicine_records_profile ON medicine_records(profile_id);
CREATE INDEX idx_symptom_queries_profile ON symptom_queries(profile_id);
CREATE INDEX idx_response_logs_query ON response_logs(query_id);

CREATE TABLE community_schemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  eligibility_criteria JSONB,
  scheme_type VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  link TEXT,
  states TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blood_banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  blood_available TEXT[],
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vaccination_camps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  camp_date DATE NOT NULL,
  vaccines TEXT[],
  age_group VARCHAR(50),
  is_free BOOLEAN DEFAULT TRUE,
  registration_link TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outbreak_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disease VARCHAR(100) NOT NULL,
  region VARCHAR(255) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'low',
  message TEXT NOT NULL,
  source VARCHAR(255),
  starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ends_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_community_schemes_type ON community_schemes(scheme_type);
CREATE INDEX idx_community_schemes_states ON community_schemes USING GIN(states);
CREATE INDEX idx_blood_banks_city ON blood_banks(city);
CREATE INDEX idx_vaccination_camps_city ON vaccination_camps(city);
CREATE INDEX idx_vaccination_camps_date ON vaccination_camps(camp_date);
CREATE INDEX idx_outbreak_alerts_active ON outbreak_alerts(is_active);

CREATE TABLE symptom_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  normalized_input TEXT NOT NULL,
  original_input TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  response_content TEXT NOT NULL,
  safety_score DECIMAL(3,2),
  escalation_flag BOOLEAN DEFAULT FALSE,
  source VARCHAR(50) DEFAULT 'groq_llama3',
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_symptom_cache_normalized ON symptom_cache USING GIN(normalized_input gin_trgm_ops);
CREATE INDEX idx_symptom_cache_language ON symptom_cache(language);
