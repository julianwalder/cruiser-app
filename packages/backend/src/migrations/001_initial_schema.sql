-- Initial schema for Cruiser Aviation
-- Run with: npx wrangler d1 execute cruiser-db-staging --file=./src/migrations/001_initial_schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Bases table
CREATE TABLE IF NOT EXISTS bases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Aircraft table
CREATE TABLE IF NOT EXISTS aircraft (
  id TEXT PRIMARY KEY,
  registration TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  base_id TEXT NOT NULL,
  documents TEXT, -- JSON array of document URLs
  images TEXT, -- JSON array of image URLs
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (base_id) REFERENCES bases(id) ON DELETE CASCADE
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (base_id) REFERENCES bases(id) ON DELETE CASCADE
);

-- Flights table (for future use)
CREATE TABLE IF NOT EXISTS flights (
  id TEXT PRIMARY KEY,
  aircraft_id TEXT NOT NULL,
  pilot_id TEXT NOT NULL,
  departure_base_id TEXT NOT NULL,
  arrival_base_id TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  arrival_time TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (aircraft_id) REFERENCES aircraft(id) ON DELETE CASCADE,
  FOREIGN KEY (pilot_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (departure_base_id) REFERENCES bases(id) ON DELETE CASCADE,
  FOREIGN KEY (arrival_base_id) REFERENCES bases(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_aircraft_registration ON aircraft(registration);
CREATE INDEX IF NOT EXISTS idx_aircraft_base_id ON aircraft(base_id);
CREATE INDEX IF NOT EXISTS idx_services_base_id ON services(base_id);
CREATE INDEX IF NOT EXISTS idx_flights_aircraft_id ON flights(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_flights_pilot_id ON flights(pilot_id);
CREATE INDEX IF NOT EXISTS idx_flights_departure_time ON flights(departure_time);

-- Insert sample data
INSERT OR IGNORE INTO bases (id, name, location, description, created_at, updated_at) VALUES
('base-1', 'Main Base', 'London Heathrow', 'Primary operational base', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('base-2', 'Secondary Base', 'Manchester Airport', 'Secondary operational base', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');

INSERT OR IGNORE INTO services (id, name, description, base_id, created_at, updated_at) VALUES
('service-1', 'Aircraft Maintenance', 'Full aircraft maintenance services', 'base-1', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('service-2', 'Flight Training', 'Pilot training and certification', 'base-1', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('service-3', 'Charter Services', 'Private charter flights', 'base-2', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');

INSERT OR IGNORE INTO aircraft (id, registration, type, base_id, created_at, updated_at) VALUES
('aircraft-1', 'G-ABCD', 'Cessna 172', 'base-1', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('aircraft-2', 'G-EFGH', 'Piper PA-28', 'base-1', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('aircraft-3', 'G-IJKL', 'Beechcraft Baron', 'base-2', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'); 