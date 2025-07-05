#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock data from local development environment
const mockData = {
  services: [
    { 
      id: '1', 
      name: 'Flight Training', 
      description: 'Professional flight instruction',
      type: 'flight_training',
      base_price: 150,
      default_payment_plan: 'hourly',
      is_active: true,
      image_url: 'https://picsum.photos/400/300?random=service1'
    },
    { 
      id: '2', 
      name: 'Aircraft Rental', 
      description: 'Hourly aircraft rental',
      type: 'aircraft_rental',
      base_price: 200,
      default_payment_plan: 'hourly',
      is_active: true,
      image_url: 'https://picsum.photos/400/300?random=service2'
    },
    { 
      id: '3', 
      name: 'Maintenance', 
      description: 'Aircraft maintenance services',
      type: 'maintenance',
      base_price: 100,
      default_payment_plan: 'hourly',
      is_active: true,
      image_url: 'https://picsum.photos/400/300?random=service3'
    }
  ],
  bases: [
    { 
      id: '1', 
      name: 'Main Airport', 
      city: 'Downtown',
      country: 'USA',
      icao_code: 'MAIN',
      image_url: 'https://picsum.photos/400/300?random=base1',
      is_active: true
    },
    { 
      id: '2', 
      name: 'Regional Field', 
      city: 'Suburbs',
      country: 'USA',
      icao_code: 'REG',
      image_url: 'https://picsum.photos/400/300?random=base2',
      is_active: true
    }
  ],
  aircraft: [
    { 
      id: '1', 
      call_sign: 'Cessna 172', 
      registration: 'N12345',
      type: 'Single Engine',
      model: '172 Skyhawk',
      manufacturer: 'Cessna',
      year: 2018,
      base_id: '1',
      image_url: 'https://picsum.photos/400/300?random=aircraft1',
      is_active: true,
      hourly_rate: 150,
      total_flight_hours: 1200,
      last_maintenance_date: '2024-01-01',
      next_maintenance_date: '2024-07-01'
    },
    { 
      id: '2', 
      call_sign: 'Piper Arrow', 
      registration: 'N67890',
      type: 'Single Engine',
      model: 'PA-28R Arrow',
      manufacturer: 'Piper',
      year: 2019,
      base_id: '2',
      image_url: 'https://picsum.photos/400/300?random=aircraft2',
      is_active: true,
      hourly_rate: 200,
      total_flight_hours: 800,
      last_maintenance_date: '2024-02-01',
      next_maintenance_date: '2024-08-01'
    }
  ],
  users: [
    { 
      id: '1', 
      email: 'admin@cruiser.com', 
      first_name: 'Admin',
      last_name: 'User',
      phone_number: '+1 (555) 111-1111',
      role: 'admin',
      status: 'active',
      is_fully_verified: true,
      has_ppl: true,
      credited_hours: 950,
      total_flight_hours: 1000,
      base_id: '1',
      image_url: 'https://picsum.photos/150/150?random=user1'
    },
    { 
      id: '2', 
      email: 'pilot@cruiser.com', 
      first_name: 'Pilot',
      last_name: 'User',
      phone_number: '+1 (555) 222-2222',
      role: 'pilot',
      status: 'active',
      is_fully_verified: true,
      has_ppl: true,
      credited_hours: 480,
      total_flight_hours: 500,
      base_id: '1',
      image_url: 'https://picsum.photos/150/150?random=user2'
    },
    {
      id: '3',
      email: 'student@cruiser.com',
      first_name: 'Student',
      last_name: 'Pilot',
      phone_number: '+1 (555) 333-3333',
      role: 'student_pilot',
      status: 'active',
      is_fully_verified: false,
      has_ppl: false,
      credited_hours: 20,
      total_flight_hours: 25,
      base_id: '2',
      image_url: 'https://picsum.photos/150/150?random=user3'
    }
  ]
};

// Database names from wrangler.toml
const DATABASE_NAMES = {
  staging: 'cruiser-db-staging',
  production: 'cruiser-db-prod'
};

// R2 bucket names from wrangler.toml
const R2_BUCKETS = {
  staging: 'cruiser-storage-staging',
  production: 'cruiser-storage-prod'
};

// Helper function to run commands
function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completed successfully`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

// Helper function to create SQL insert statements
function createInsertSQL(table, data) {
  if (!data || data.length === 0) return '';
  
  const columns = Object.keys(data[0]);
  const values = data.map(row => {
    return `(${columns.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
      if (typeof value === 'boolean') return value ? '1' : '0';
      return value;
    }).join(', ')})`;
  });
  
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values.join(', ')};`;
}

// Function to populate D1 database
async function populateD1Database(environment) {
  console.log(`\n🗄️  Populating D1 database for ${environment}...`);
  
  // Create SQL file with all the data
  const sqlContent = `
-- Populate ${environment} D1 database with mock data
-- Generated on ${new Date().toISOString()}

-- Clear existing data (in reverse dependency order)
DELETE FROM users;
DELETE FROM aircraft;
DELETE FROM services;
DELETE FROM bases;

-- Insert bases first (no dependencies)
${createInsertSQL('bases', mockData.bases)}

-- Insert services (no dependencies)
${createInsertSQL('services', mockData.services)}

-- Insert users (depends on bases)
${createInsertSQL('users', mockData.users)}

-- Insert aircraft (depends on bases)
${createInsertSQL('aircraft', mockData.aircraft)}
`;

  const sqlFile = `temp_${environment}_data.sql`;
  fs.writeFileSync(sqlFile, sqlContent);
  
  try {
    // Execute the SQL file against the D1 database
    runCommand(
      `npx wrangler d1 execute ${DATABASE_NAMES[environment]} --remote --file ${sqlFile}`,
      `Executing SQL for ${environment} D1 database`
    );
    
    // Clean up
    fs.unlinkSync(sqlFile);
    
    console.log(`✅ D1 database populated for ${environment}`);
  } catch (error) {
    console.error(`❌ Failed to populate D1 database for ${environment}:`, error.message);
    if (fs.existsSync(sqlFile)) {
      fs.unlinkSync(sqlFile);
    }
    throw error;
  }
}

// Function to populate R2 storage
async function populateR2Storage(environment) {
  console.log(`\n☁️  Populating R2 storage for ${environment}...`);
  
  // Create sample images and upload them to R2
  const imageUrls = [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=2',
    'https://picsum.photos/400/300?random=3',
    'https://picsum.photos/150/150?random=4',
    'https://picsum.photos/150/150?random=5',
    'https://picsum.photos/150/150?random=6'
  ];
  
  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    const fileName = `sample-image-${i + 1}.jpg`;
    
    try {
      // Download image and upload to R2
      runCommand(
        `curl -s "${imageUrl}" | npx wrangler r2 object put ${R2_BUCKETS[environment]}/${fileName} --file -`,
        `Uploading ${fileName} to ${environment} R2 storage`
      );
    } catch (error) {
      console.warn(`⚠️  Failed to upload ${fileName} to ${environment} R2 storage:`, error.message);
    }
  }
  
  console.log(`✅ R2 storage populated for ${environment}`);
}

// Function to verify population
async function verifyPopulation(environment) {
  console.log(`\n🔍 Verifying population for ${environment}...`);
  
  try {
    // Check D1 database
    const d1Result = runCommand(
      `npx wrangler d1 execute ${DATABASE_NAMES[environment]} --remote --command "SELECT COUNT(*) as count FROM users UNION ALL SELECT COUNT(*) FROM bases UNION ALL SELECT COUNT(*) FROM services UNION ALL SELECT COUNT(*) FROM aircraft;"`,
      `Checking ${environment} D1 database counts`
    );
    console.log(`📊 ${environment} D1 Database counts:\n${d1Result}`);
    
    // Check R2 storage
    const r2Result = runCommand(
      `npx wrangler r2 object list ${R2_BUCKETS[environment]}`,
      `Listing ${environment} R2 storage objects`
    );
    console.log(`📁 ${environment} R2 Storage objects:\n${r2Result}`);
    
  } catch (error) {
    console.error(`❌ Failed to verify ${environment} population:`, error.message);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const environments = args.length > 0 ? args : ['staging', 'production'];
  
  console.log('🚀 Starting environment population...');
  console.log(`📋 Environments to populate: ${environments.join(', ')}`);
  
  for (const environment of environments) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎯 POPULATING ${environment.toUpperCase()} ENVIRONMENT`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      // Populate D1 database
      await populateD1Database(environment);
      
      // Populate R2 storage
      await populateR2Storage(environment);
      
      // Verify population
      await verifyPopulation(environment);
      
      console.log(`\n✅ ${environment.toUpperCase()} environment populated successfully!`);
      
    } catch (error) {
      console.error(`\n❌ Failed to populate ${environment} environment:`, error.message);
      process.exit(1);
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log('🎉 ALL ENVIRONMENTS POPULATED SUCCESSFULLY!');
  console.log(`${'='.repeat(50)}`);
  console.log('\n📝 Next steps:');
  console.log('1. Test your staging environment');
  console.log('2. Verify data appears correctly in your application');
  console.log('3. Deploy to production when ready');
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 