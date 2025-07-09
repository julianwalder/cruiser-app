-- Cruiser Aviation Platform D1 Database Schema
-- Compatible with Cloudflare D1 (SQLite-based)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    role TEXT CHECK(role IN ('admin', 'instructor', 'student_pilot', 'pilot')) DEFAULT 'student_pilot',
    status TEXT CHECK(status IN ('active', 'inactive', 'pending', 'suspended')) DEFAULT 'active',
    is_fully_verified BOOLEAN DEFAULT FALSE,
    has_ppl BOOLEAN DEFAULT FALSE,
    credited_hours REAL DEFAULT 0,
    total_flight_hours REAL DEFAULT 0,
    base_id TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bases table
CREATE TABLE IF NOT EXISTS bases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    icao_code TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    type TEXT CHECK(type IN ('flight_training', 'aircraft_rental', 'maintenance', 'fuel', 'other')) DEFAULT 'flight_training',
    base_price REAL NOT NULL,
    default_payment_plan TEXT CHECK(default_payment_plan IN ('hourly', 'package', 'subscription')) DEFAULT 'hourly',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Aircraft table
CREATE TABLE IF NOT EXISTS aircraft (
    id TEXT PRIMARY KEY,
    call_sign TEXT UNIQUE NOT NULL,
    registration TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    model TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    year INTEGER,
    base_id TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    hourly_rate REAL NOT NULL,
    total_flight_hours REAL DEFAULT 0,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_id) REFERENCES bases(id)
);

-- Flights table
CREATE TABLE IF NOT EXISTS flights (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    aircraft_id TEXT NOT NULL,
    instructor_id TEXT,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME,
    duration_minutes INTEGER,
    departure_airport TEXT,
    arrival_airport TEXT,
    flight_type TEXT CHECK(flight_type IN ('training', 'solo', 'cross_country', 'other')) DEFAULT 'training',
    status TEXT CHECK(status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (aircraft_id) REFERENCES aircraft(id),
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    flight_id TEXT,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT CHECK(status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (flight_id) REFERENCES flights(id)
);

-- Import Jobs table (for tracking airfield import operations)
CREATE TABLE IF NOT EXISTS import_jobs (
    id TEXT PRIMARY KEY,
    job_type TEXT NOT NULL,
    status TEXT CHECK(status IN ('running', 'completed', 'failed')) DEFAULT 'running',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Imported Airfields table (for storing OurAirports data)
CREATE TABLE IF NOT EXISTS imported_airfields (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))), -- UUID by default
    our_airports_id INTEGER,
    name TEXT NOT NULL,
    icao_code TEXT,
    iata_code TEXT,
    type TEXT CHECK(type IN ('airport', 'heliport', 'seaplane_base', 'closed')),
    latitude REAL,
    longitude REAL,
    elevation_ft INTEGER,
    continent TEXT,
    country_code TEXT,
    country_name TEXT,
    region_code TEXT,
    region_name TEXT,
    municipality TEXT,
    scheduled_service BOOLEAN DEFAULT FALSE,
    gps_code TEXT,
    local_code TEXT,
    home_link TEXT,
    wikipedia_link TEXT,
    keywords TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Base Designations table (for designating airfields as company bases)
CREATE TABLE IF NOT EXISTS base_designations (
    id TEXT PRIMARY KEY,
    airfield_id TEXT NOT NULL,
    base_name TEXT NOT NULL,
    description TEXT,
    base_manager TEXT,
    notes TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (airfield_id) REFERENCES imported_airfields(id)
);

-- Continents table
CREATE TABLE IF NOT EXISTS continents (
    code TEXT PRIMARY KEY, -- e.g., 'AF', 'EU', etc.
    name TEXT NOT NULL
);

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
    code TEXT PRIMARY KEY, -- e.g., 'US', 'DE', etc.
    name TEXT NOT NULL,
    continent_code TEXT NOT NULL REFERENCES continents(code),
    wikipedia_link TEXT,
    keywords TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_base_id ON users(base_id);

CREATE INDEX IF NOT EXISTS idx_bases_city ON bases(city);
CREATE INDEX IF NOT EXISTS idx_bases_country ON bases(country);
CREATE INDEX IF NOT EXISTS idx_bases_icao_code ON bases(icao_code);

CREATE INDEX IF NOT EXISTS idx_services_type ON services(type);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

CREATE INDEX IF NOT EXISTS idx_aircraft_call_sign ON aircraft(call_sign);
CREATE INDEX IF NOT EXISTS idx_aircraft_registration ON aircraft(registration);
CREATE INDEX IF NOT EXISTS idx_aircraft_base_id ON aircraft(base_id);
CREATE INDEX IF NOT EXISTS idx_aircraft_is_active ON aircraft(is_active);

CREATE INDEX IF NOT EXISTS idx_flights_user_id ON flights(user_id);
CREATE INDEX IF NOT EXISTS idx_flights_aircraft_id ON flights(aircraft_id);
CREATE INDEX IF NOT EXISTS idx_flights_departure_time ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_import_jobs_type ON import_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_at ON import_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_imported_airfields_country ON imported_airfields(country_code);
CREATE INDEX IF NOT EXISTS idx_imported_airfields_type ON imported_airfields(type);
CREATE INDEX IF NOT EXISTS idx_imported_airfields_icao ON imported_airfields(icao_code);
CREATE INDEX IF NOT EXISTS idx_imported_airfields_iata ON imported_airfields(iata_code);
CREATE INDEX IF NOT EXISTS idx_imported_airfields_active ON imported_airfields(is_active);

CREATE INDEX IF NOT EXISTS idx_base_designations_airfield ON base_designations(airfield_id);
CREATE INDEX IF NOT EXISTS idx_base_designations_active ON base_designations(is_active); 