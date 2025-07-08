-- Fix Airfield Types Migration for Cruiser Aviation
-- Run with: npx wrangler d1 execute cruiser-db-staging --file=./src/migrations/003_fix_airfield_types.sql

-- Update the CHECK constraint on the imported_airfields table to allow all OurAirports types
-- First, we need to drop the existing constraint and recreate it

-- Create a new table with the correct constraint
CREATE TABLE IF NOT EXISTS imported_airfields_new (
  id TEXT PRIMARY KEY,
  our_airports_id INTEGER UNIQUE NOT NULL, -- Original OurAirports ID
  name TEXT NOT NULL,
  icao_code TEXT,
  iata_code TEXT,
  type TEXT NOT NULL CHECK (type IN ('airport', 'small_airport', 'medium_airport', 'large_airport', 'heliport', 'seaplane_base', 'balloonport', 'closed')),
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

-- Copy all data from the old table to the new table
INSERT INTO imported_airfields_new 
SELECT * FROM imported_airfields;

-- Drop the old table
DROP TABLE imported_airfields;

-- Rename the new table to the original name
ALTER TABLE imported_airfields_new RENAME TO imported_airfields;

-- Recreate the indexes
CREATE INDEX IF NOT EXISTS idx_imported_airfields_country_code ON imported_airfields(country_code);
CREATE INDEX IF NOT EXISTS idx_imported_airfields_type ON imported_airfields(type);
CREATE INDEX IF NOT EXISTS idx_imported_airfields_icao_code ON imported_airfields(icao_code);
CREATE INDEX IF NOT EXISTS idx_imported_airfields_iata_code ON imported_airfields(iata_code);

-- Verify the constraint is working
SELECT COUNT(*) as total_airfields FROM imported_airfields;
SELECT type, COUNT(*) as count FROM imported_airfields GROUP BY type ORDER BY count DESC; 