#!/usr/bin/env node

/**
 * Script to add a new student user to the database
 * Usage: node scripts/add-student-user.js
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default student user data
const defaultStudentData = {
  email: 'student@example.com',
  firstName: 'John',
  lastName: 'Student',
  phoneNumber: '+1 (555) 123-4567',
  role: 'user', // This maps to UserRole.USER which is the student role
  status: 'active',
  dateOfBirth: '1995-01-15',
  address: '123 Student Street',
  city: 'Student City',
  region: 'Student Region',
  country: 'United States',
  postalCode: '12345',
  nationality: 'American',
  sex: 'Not specified',
  totalFlightHours: 0,
  creditedHours: 0,
  isIdVerified: false,
  isMedicalVerified: false,
  isPhoneVerified: false,
  isEmailVerified: false,
  hasPPL: false
};

// Function to generate a random UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Function to create student user data
function createStudentUser(customData = {}) {
  const userData = {
    id: generateUUID(),
    ...defaultStudentData,
    ...customData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return userData;
}

// Function to generate SQL insert statement
function generateSQLInsert(userData) {
  const columns = Object.keys(userData);
  const values = Object.values(userData).map(value => {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    return `'${value}'`;
  });

  return `INSERT INTO users (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

// Function to generate JSON data
function generateJSONData(userData) {
  return JSON.stringify(userData, null, 2);
}

// Main function
function main() {
  console.log('🎓 Student User Creation Script');
  console.log('================================\n');

  // Get custom data from command line arguments or use defaults
  const args = process.argv.slice(2);
  let customData = {};

  if (args.length > 0) {
    try {
      customData = JSON.parse(args[0]);
    } catch (error) {
      console.log('❌ Invalid JSON provided as argument, using default data');
    }
  }

  // Create student user
  const studentUser = createStudentUser(customData);

  console.log('📋 Student User Data:');
  console.log(JSON.stringify(studentUser, null, 2));
  console.log('\n');

  // Generate SQL insert statement
  const sqlInsert = generateSQLInsert(studentUser);
  console.log('🗄️  SQL Insert Statement:');
  console.log(sqlInsert);
  console.log('\n');

  // Save to files
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Save SQL to file
  const sqlFilename = `student-user-${timestamp}.sql`;
  const sqlPath = join(__dirname, sqlFilename);
  
  try {
    const fs = await import('fs/promises');
    await fs.writeFile(sqlPath, sqlInsert);
    console.log(`💾 SQL saved to: ${sqlPath}`);
  } catch (error) {
    console.log('❌ Could not save SQL file:', error.message);
  }

  // Save JSON to file
  const jsonFilename = `student-user-${timestamp}.json`;
  const jsonPath = join(__dirname, jsonFilename);
  
  try {
    const fs = await import('fs/promises');
    await fs.writeFile(jsonPath, generateJSONData(studentUser));
    console.log(`💾 JSON saved to: ${jsonPath}`);
  } catch (error) {
    console.log('❌ Could not save JSON file:', error.message);
  }

  console.log('\n✅ Student user data generated successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Run the SQL insert statement in your database');
  console.log('2. Configure Cloudflare Access for the new user');
  console.log('3. Set up authentication credentials');
  console.log('4. Update any necessary permissions or roles');
}

// Run the script
main().catch(console.error); 