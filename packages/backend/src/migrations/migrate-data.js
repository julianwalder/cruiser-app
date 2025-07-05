// Data migration script for Cruiser Aviation
// This script helps migrate data from the old NestJS backend to the new Workers backend
// Run with: node src/migrations/migrate-data.js

import { D1Database } from '@cloudflare/workers-types';

// Sample data structure for migration
const sampleData = {
  users: [
    {
      id: 'user-1',
      email: 'admin@cruiseraviation.com',
      name: 'Admin User',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user-2',
      email: 'pilot@cruiseraviation.com',
      name: 'Pilot User',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  bases: [
    {
      id: 'base-1',
      name: 'Main Base',
      location: 'London Heathrow',
      description: 'Primary operational base',
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'base-2',
      name: 'Secondary Base',
      location: 'Manchester Airport',
      description: 'Secondary operational base',
      image_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  aircraft: [
    {
      id: 'aircraft-1',
      registration: 'G-ABCD',
      type: 'Cessna 172',
      base_id: 'base-1',
      documents: JSON.stringify([]),
      images: JSON.stringify([]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'aircraft-2',
      registration: 'G-EFGH',
      type: 'Piper PA-28',
      base_id: 'base-1',
      documents: JSON.stringify([]),
      images: JSON.stringify([]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'aircraft-3',
      registration: 'G-IJKL',
      type: 'Beechcraft Baron',
      base_id: 'base-2',
      documents: JSON.stringify([]),
      images: JSON.stringify([]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  services: [
    {
      id: 'service-1',
      name: 'Aircraft Maintenance',
      description: 'Full aircraft maintenance services',
      base_id: 'base-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'service-2',
      name: 'Flight Training',
      description: 'Pilot training and certification',
      base_id: 'base-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'service-3',
      name: 'Charter Services',
      description: 'Private charter flights',
      base_id: 'base-2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Migration functions
export async function migrateUsers(db) {
  console.log('Migrating users...');
  for (const user of sampleData.users) {
    try {
      await db.prepare(`
        INSERT OR REPLACE INTO users (id, email, name, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(user.id, user.email, user.name, user.role, user.created_at, user.updated_at).run();
      console.log(`✓ Migrated user: ${user.email}`);
    } catch (error) {
      console.error(`✗ Failed to migrate user ${user.email}:`, error);
    }
  }
}

export async function migrateBases(db) {
  console.log('Migrating bases...');
  for (const base of sampleData.bases) {
    try {
      await db.prepare(`
        INSERT OR REPLACE INTO bases (id, name, location, description, image_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(base.id, base.name, base.location, base.description, base.image_url, base.created_at, base.updated_at).run();
      console.log(`✓ Migrated base: ${base.name}`);
    } catch (error) {
      console.error(`✗ Failed to migrate base ${base.name}:`, error);
    }
  }
}

export async function migrateAircraft(db) {
  console.log('Migrating aircraft...');
  for (const aircraft of sampleData.aircraft) {
    try {
      await db.prepare(`
        INSERT OR REPLACE INTO aircraft (id, registration, type, base_id, documents, images, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(aircraft.id, aircraft.registration, aircraft.type, aircraft.base_id, aircraft.documents, aircraft.images, aircraft.created_at, aircraft.updated_at).run();
      console.log(`✓ Migrated aircraft: ${aircraft.registration}`);
    } catch (error) {
      console.error(`✗ Failed to migrate aircraft ${aircraft.registration}:`, error);
    }
  }
}

export async function migrateServices(db) {
  console.log('Migrating services...');
  for (const service of sampleData.services) {
    try {
      await db.prepare(`
        INSERT OR REPLACE INTO services (id, name, description, base_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(service.id, service.name, service.description, service.base_id, service.created_at, service.updated_at).run();
      console.log(`✓ Migrated service: ${service.name}`);
    } catch (error) {
      console.error(`✗ Failed to migrate service ${service.name}:`, error);
    }
  }
}

// Main migration function
export async function runMigration(db) {
  console.log('🚀 Starting data migration...');
  
  try {
    await migrateUsers(db);
    await migrateBases(db);
    await migrateAircraft(db);
    await migrateServices(db);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Export sample data for reference
export { sampleData }; 