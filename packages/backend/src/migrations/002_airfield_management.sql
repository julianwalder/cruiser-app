-- Airfield Management Schema for Cruiser Aviation
-- Run with: npx wrangler d1 execute cruiser-db-staging --file=./src/migrations/002_airfield_management.sql

-- Operational Areas table (continents and countries)
CREATE TABLE IF NOT EXISTS operational_areas (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('continent', 'country')),
  code TEXT UNIQUE NOT NULL, -- ISO codes (e.g., 'EU' for Europe, 'GB' for UK)
  name TEXT NOT NULL,
  parent_id TEXT, -- For countries, references continent
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES operational_areas(id) ON DELETE CASCADE
);

-- Imported Airfields table (from OurAirports dataset)
CREATE TABLE IF NOT EXISTS imported_airfields (
  id TEXT PRIMARY KEY,
  our_airports_id INTEGER UNIQUE NOT NULL, -- Original OurAirports ID
  name TEXT NOT NULL,
  icao_code TEXT,
  iata_code TEXT,
  type TEXT NOT NULL CHECK (type IN ('airport', 'heliport', 'seaplane_base', 'closed')),
  latitude REAL,
  longitude REAL,
  elevation_ft INTEGER,
  continent TEXT,
  country_code TEXT,
  country_name TEXT,
  region_code TEXT,
  region_name TEXT,
  municipality TEXT,
  scheduled_service BOOLEAN DEFAULT 0,
  gps_code TEXT,
  local_code TEXT,
  home_link TEXT,
  wikipedia_link TEXT,
  keywords TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Base Designations table (links airfields to company bases)
CREATE TABLE IF NOT EXISTS base_designations (
  id TEXT PRIMARY KEY,
  airfield_id TEXT NOT NULL,
  base_name TEXT NOT NULL, -- Custom name for the base
  description TEXT,
  base_manager TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (airfield_id) REFERENCES imported_airfields(id) ON DELETE CASCADE
);

-- Base Images table (for R2 storage references)
CREATE TABLE IF NOT EXISTS base_images (
  id TEXT PRIMARY KEY,
  base_designation_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (base_designation_id) REFERENCES base_designations(id) ON DELETE CASCADE
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  old_values TEXT, -- JSON string of old values
  new_values TEXT, -- JSON string of new values
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Import Jobs table (for tracking import progress)
CREATE TABLE IF NOT EXISTS import_jobs (
  id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL CHECK (job_type IN ('airfields_import', 'data_update')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_operational_areas_type ON operational_areas(type);
CREATE INDEX IF NOT EXISTS idx_operational_areas_parent_id ON operational_areas(parent_id);
CREATE INDEX IF NOT EXISTS idx_imported_airfields_country_code ON imported_airfields(country_code);
CREATE INDEX IF NOT EXISTS idx_imported_airfields_type ON imported_airfields(type);
CREATE INDEX IF NOT EXISTS idx_imported_airfields_icao_code ON imported_airfields(icao_code);
CREATE INDEX IF NOT EXISTS idx_imported_airfields_iata_code ON imported_airfields(iata_code);
CREATE INDEX IF NOT EXISTS idx_base_designations_airfield_id ON base_designations(airfield_id);
CREATE INDEX IF NOT EXISTS idx_base_images_base_designation_id ON base_images(base_designation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);

-- Insert sample operational areas (continents)
INSERT OR IGNORE INTO operational_areas (id, type, code, name, created_at, updated_at) VALUES
('continent-eu', 'continent', 'EU', 'Europe', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('continent-na', 'continent', 'NA', 'North America', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('continent-as', 'continent', 'AS', 'Asia', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('continent-af', 'continent', 'AF', 'Africa', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('continent-sa', 'continent', 'SA', 'South America', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('continent-oc', 'continent', 'OC', 'Oceania', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('continent-an', 'continent', 'AN', 'Antarctica', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');

-- Insert sample countries (focusing on Europe for now)
INSERT OR IGNORE INTO operational_areas (id, type, code, name, parent_id, created_at, updated_at) VALUES
('country-gb', 'country', 'GB', 'United Kingdom', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-fr', 'country', 'FR', 'France', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-de', 'country', 'DE', 'Germany', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-it', 'country', 'IT', 'Italy', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-es', 'country', 'ES', 'Spain', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-nl', 'country', 'NL', 'Netherlands', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-be', 'country', 'BE', 'Belgium', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-ch', 'country', 'CH', 'Switzerland', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-at', 'country', 'AT', 'Austria', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-se', 'country', 'SE', 'Sweden', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-no', 'country', 'NO', 'Norway', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-dk', 'country', 'DK', 'Denmark', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-fi', 'country', 'FI', 'Finland', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-pl', 'country', 'PL', 'Poland', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-cz', 'country', 'CZ', 'Czech Republic', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-hu', 'country', 'HU', 'Hungary', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-ro', 'country', 'RO', 'Romania', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-bg', 'country', 'BG', 'Bulgaria', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-hr', 'country', 'HR', 'Croatia', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-si', 'country', 'SI', 'Slovenia', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-sk', 'country', 'SK', 'Slovakia', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-lt', 'country', 'LT', 'Lithuania', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-lv', 'country', 'LV', 'Latvia', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-ee', 'country', 'EE', 'Estonia', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-ie', 'country', 'IE', 'Ireland', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-pt', 'country', 'PT', 'Portugal', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-gr', 'country', 'GR', 'Greece', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-cy', 'country', 'CY', 'Cyprus', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-mt', 'country', 'MT', 'Malta', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-lu', 'country', 'LU', 'Luxembourg', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-is', 'country', 'IS', 'Iceland', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-li', 'country', 'LI', 'Liechtenstein', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-mc', 'country', 'MC', 'Monaco', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-sm', 'country', 'SM', 'San Marino', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-va', 'country', 'VA', 'Vatican City', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-ad', 'country', 'AD', 'Andorra', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-al', 'country', 'AL', 'Albania', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-ba', 'country', 'BA', 'Bosnia and Herzegovina', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-me', 'country', 'ME', 'Montenegro', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-mk', 'country', 'MK', 'North Macedonia', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-rs', 'country', 'RS', 'Serbia', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-ua', 'country', 'UA', 'Ukraine', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-by', 'country', 'BY', 'Belarus', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-md', 'country', 'MD', 'Moldova', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-tr', 'country', 'TR', 'Turkey', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-ge', 'country', 'GE', 'Georgia', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-am', 'country', 'AM', 'Armenia', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-az', 'country', 'AZ', 'Azerbaijan', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-ru', 'country', 'RU', 'Russia', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('country-kz', 'country', 'KZ', 'Kazakhstan', 'continent-eu', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'); 