PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
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
INSERT INTO users VALUES('1','admin@cruiser.com','Admin','User','+1 (555) 111-1111','admin','active',1,1,950,1000,'1','https://picsum.photos/150/150?random=user1','2025-07-05 13:42:59','2025-07-05 13:42:59');
INSERT INTO users VALUES('2','pilot@cruiser.com','Pilot','User','+1 (555) 222-2222','pilot','active',1,1,480,500,'1','https://picsum.photos/150/150?random=user2','2025-07-05 13:42:59','2025-07-05 13:42:59');
INSERT INTO users VALUES('3','student@cruiser.com','Student','Pilot','+1 (555) 333-3333','student_pilot','active',0,0,20,25,'2','https://picsum.photos/150/150?random=user3','2025-07-05 13:42:59','2025-07-05 13:42:59');
CREATE TABLE bases (
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
INSERT INTO bases VALUES('1','Main Airport','Downtown','USA','MAIN','https://picsum.photos/400/300?random=base1',1,'2025-07-05 13:42:59','2025-07-05 13:42:59');
INSERT INTO bases VALUES('2','Regional Field','Suburbs','USA','REG','https://picsum.photos/400/300?random=base2',1,'2025-07-05 13:42:59','2025-07-05 13:42:59');
CREATE TABLE services (
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
INSERT INTO services VALUES('1','Flight Training','Professional flight instruction','https://picsum.photos/400/300?random=service1','flight_training',150,'hourly',1,'2025-07-05 13:42:59','2025-07-05 13:42:59');
INSERT INTO services VALUES('2','Aircraft Rental','Hourly aircraft rental','https://picsum.photos/400/300?random=service2','aircraft_rental',200,'hourly',1,'2025-07-05 13:42:59','2025-07-05 13:42:59');
INSERT INTO services VALUES('3','Maintenance','Aircraft maintenance services','https://picsum.photos/400/300?random=service3','maintenance',100,'hourly',1,'2025-07-05 13:42:59','2025-07-05 13:42:59');
CREATE TABLE aircraft (
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
INSERT INTO aircraft VALUES('1','Cessna 172','N12345','Single Engine','172 Skyhawk','Cessna',2018,'1','https://picsum.photos/400/300?random=aircraft1',1,150,1200,'2024-01-01','2024-07-01','2025-07-05 13:42:59','2025-07-05 13:42:59');
INSERT INTO aircraft VALUES('2','Piper Arrow','N67890','Single Engine','PA-28R Arrow','Piper',2019,'2','https://picsum.photos/400/300?random=aircraft2',1,200,800,'2024-02-01','2024-08-01','2025-07-05 13:42:59','2025-07-05 13:42:59');
CREATE TABLE flights (
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
CREATE TABLE invoices (
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_base_id ON users(base_id);
CREATE INDEX idx_bases_city ON bases(city);
CREATE INDEX idx_bases_country ON bases(country);
CREATE INDEX idx_bases_icao_code ON bases(icao_code);
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_services_is_active ON services(is_active);
CREATE INDEX idx_aircraft_call_sign ON aircraft(call_sign);
CREATE INDEX idx_aircraft_registration ON aircraft(registration);
CREATE INDEX idx_aircraft_base_id ON aircraft(base_id);
CREATE INDEX idx_aircraft_is_active ON aircraft(is_active);
CREATE INDEX idx_flights_user_id ON flights(user_id);
CREATE INDEX idx_flights_aircraft_id ON flights(aircraft_id);
CREATE INDEX idx_flights_departure_time ON flights(departure_time);
CREATE INDEX idx_flights_status ON flights(status);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
