-- Cruiser Aviation Platform Seed Data
-- Sample data for development and testing

-- Insert sample bases
INSERT OR REPLACE INTO bases (id, name, city, country, icao_code, image_url, is_active) VALUES
('base-001', 'Bucharest Henri Coandă International Airport', 'Bucharest', 'Romania', 'LROP', '/uploads/bases/bucharest-airport.jpg', TRUE),
('base-002', 'Cluj-Napoca International Airport', 'Cluj-Napoca', 'Romania', 'LRCL', '/uploads/bases/cluj-airport.jpg', TRUE),
('base-003', 'Timișoara Traian Vuia International Airport', 'Timișoara', 'Romania', 'LRTR', '/uploads/bases/timisoara-airport.jpg', TRUE),
('base-004', 'Iași International Airport', 'Iași', 'Romania', 'LRIA', '/uploads/bases/iasi-airport.jpg', TRUE);

-- Insert sample services
INSERT OR REPLACE INTO services (id, name, description, image_url, type, base_price, default_payment_plan, is_active) VALUES
('service-001', 'PPL Training Course', 'Complete Private Pilot License training course including theory and practical flight training', '/uploads/services/ppl-training.jpg', 'flight_training', 8500.00, 'package', TRUE),
('service-002', 'Hourly Aircraft Rental', 'Rent aircraft by the hour for solo flights or additional training', '/uploads/services/aircraft-rental.jpg', 'aircraft_rental', 180.00, 'hourly', TRUE),
('service-003', 'Flight Instructor', 'Professional flight instruction for all levels', '/uploads/services/instructor.jpg', 'flight_training', 80.00, 'hourly', TRUE),
('service-004', 'Cross-Country Training', 'Advanced training for cross-country flights and navigation', '/uploads/services/cross-country.jpg', 'flight_training', 220.00, 'hourly', TRUE),
('service-005', 'Aircraft Maintenance', 'Regular maintenance and inspection services', '/uploads/services/maintenance.jpg', 'maintenance', 150.00, 'hourly', TRUE),
('service-006', 'Fuel Service', 'Aviation fuel supply and refueling services', '/uploads/services/fuel.jpg', 'fuel', 2.50, 'hourly', TRUE);

-- Insert sample aircraft
INSERT OR REPLACE INTO aircraft (id, call_sign, registration, type, model, manufacturer, year, base_id, image_url, is_active, hourly_rate, total_flight_hours, last_maintenance_date, next_maintenance_date) VALUES
('aircraft-001', 'YR-ABC', 'YR-ABC', 'Single Engine Piston', 'Cessna 152', 'Cessna', 1980, 'base-001', '/uploads/aircraft/cessna-152.jpg', TRUE, 180.00, 2450.5, '2024-01-15', '2024-07-15'),
('aircraft-002', 'YR-DEF', 'YR-DEF', 'Single Engine Piston', 'Cessna 172', 'Cessna', 1985, 'base-001', '/uploads/aircraft/cessna-172.jpg', TRUE, 220.00, 3200.0, '2024-02-01', '2024-08-01'),
('aircraft-003', 'YR-GHI', 'YR-GHI', 'Single Engine Piston', 'Piper PA-28', 'Piper', 1990, 'base-002', '/uploads/aircraft/piper-pa28.jpg', TRUE, 240.00, 1800.5, '2024-01-20', '2024-07-20'),
('aircraft-004', 'YR-JKL', 'YR-JKL', 'Single Engine Piston', 'Diamond DA40', 'Diamond Aircraft', 2010, 'base-002', '/uploads/aircraft/diamond-da40.jpg', TRUE, 280.00, 950.0, '2024-02-10', '2024-08-10'),
('aircraft-005', 'YR-MNO', 'YR-MNO', 'Single Engine Piston', 'Cessna 152', 'Cessna', 1982, 'base-003', '/uploads/aircraft/cessna-152-2.jpg', TRUE, 180.00, 2100.0, '2024-01-25', '2024-07-25'),
('aircraft-006', 'YR-PQR', 'YR-PQR', 'Single Engine Piston', 'Cessna 172', 'Cessna', 1988, 'base-003', '/uploads/aircraft/cessna-172-2.jpg', TRUE, 220.00, 2800.5, '2024-02-05', '2024-08-05');

-- Insert sample users (admin and instructors)
INSERT OR REPLACE INTO users (id, email, first_name, last_name, phone_number, role, status, is_fully_verified, has_ppl, credited_hours, total_flight_hours, base_id, created_at) VALUES
('user-001', 'admin@cruiseraviation.com', 'Admin', 'User', '+40123456789', 'admin', 'active', TRUE, TRUE, 0, 0, 'base-001', '2024-01-01 00:00:00'),
('user-002', 'instructor1@cruiseraviation.com', 'John', 'Smith', '+40123456790', 'instructor', 'active', TRUE, TRUE, 0, 2500.0, 'base-001', '2024-01-01 00:00:00'),
('user-003', 'instructor2@cruiseraviation.com', 'Maria', 'Johnson', '+40123456791', 'instructor', 'active', TRUE, TRUE, 0, 1800.0, 'base-002', '2024-01-01 00:00:00'),
('user-004', 'student1@example.com', 'Alex', 'Brown', '+40123456792', 'student_pilot', 'active', TRUE, FALSE, 15.5, 15.5, 'base-001', '2024-01-15 00:00:00'),
('user-005', 'student2@example.com', 'Sarah', 'Wilson', '+40123456793', 'student_pilot', 'active', TRUE, FALSE, 8.0, 8.0, 'base-002', '2024-02-01 00:00:00'),
('user-006', 'pilot1@example.com', 'Michael', 'Davis', '+40123456794', 'pilot', 'active', TRUE, TRUE, 0, 450.0, 'base-001', '2024-01-10 00:00:00');

-- Insert sample flights
INSERT OR REPLACE INTO flights (id, user_id, aircraft_id, instructor_id, departure_time, arrival_time, duration_minutes, departure_airport, arrival_airport, flight_type, status, notes) VALUES
('flight-001', 'user-004', 'aircraft-001', 'user-002', '2024-07-01 09:00:00', '2024-07-01 10:30:00', 90, 'LROP', 'LROP', 'training', 'completed', 'Basic flight training - takeoffs and landings'),
('flight-002', 'user-005', 'aircraft-003', 'user-003', '2024-07-02 14:00:00', '2024-07-02 15:30:00', 90, 'LRCL', 'LRCL', 'training', 'completed', 'Navigation training - local area'),
('flight-003', 'user-006', 'aircraft-002', NULL, '2024-07-03 10:00:00', '2024-07-03 11:00:00', 60, 'LROP', 'LROP', 'solo', 'completed', 'Solo flight - pattern work'),
('flight-004', 'user-004', 'aircraft-001', 'user-002', '2024-07-05 08:00:00', '2024-07-05 09:30:00', 90, 'LROP', 'LROP', 'training', 'scheduled', 'Scheduled training flight');

-- Insert sample invoices
INSERT OR REPLACE INTO invoices (id, user_id, flight_id, amount, currency, status, due_date, notes) VALUES
('invoice-001', 'user-004', 'flight-001', 270.00, 'USD', 'paid', '2024-07-15', 'Flight training - 1.5 hours'),
('invoice-002', 'user-005', 'flight-002', 270.00, 'USD', 'sent', '2024-07-20', 'Flight training - 1.5 hours'),
('invoice-003', 'user-006', 'flight-003', 220.00, 'USD', 'paid', '2024-07-10', 'Aircraft rental - 1 hour'),
('invoice-004', 'user-004', 'flight-004', 270.00, 'USD', 'draft', '2024-07-25', 'Scheduled flight training'); 