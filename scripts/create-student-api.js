#!/usr/bin/env node

/**
 * Script to create a student user via API
 * Usage: node scripts/create-student-api.js
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:8787';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-admin-token-here';

// Default student data
const defaultStudentData = {
  email: 'student@example.com',
  firstName: 'John',
  lastName: 'Student',
  phoneNumber: '+1 (555) 123-4567',
  role: 'user', // Student role
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
  creditedHours: 0
};

// Function to create student user via API
async function createStudentUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`Failed to create student user: ${error.message}`);
  }
}

// Function to get custom data from command line
function getCustomData() {
  const args = process.argv.slice(2);
  let customData = {};

  if (args.length > 0) {
    try {
      customData = JSON.parse(args[0]);
    } catch (error) {
      console.log('❌ Invalid JSON provided as argument, using default data');
    }
  }

  return customData;
}

// Main function
async function main() {
  console.log('🎓 Create Student User via API');
  console.log('==============================\n');

  // Check if API URL is configured
  if (!process.env.API_URL && API_BASE_URL === 'http://localhost:8787') {
    console.log('⚠️  Warning: Using default API URL (http://localhost:8787)');
    console.log('   Set API_URL environment variable to use a different URL\n');
  }

  // Check if admin token is configured
  if (!process.env.ADMIN_TOKEN && ADMIN_TOKEN === 'your-admin-token-here') {
    console.log('❌ Error: ADMIN_TOKEN environment variable is required');
    console.log('   Set ADMIN_TOKEN environment variable with your admin token');
    console.log('   Example: export ADMIN_TOKEN="your-admin-token-here"');
    process.exit(1);
  }

  // Get custom data
  const customData = getCustomData();
  const userData = { ...defaultStudentData, ...customData };

  console.log('📋 Student User Data:');
  console.log(JSON.stringify(userData, null, 2));
  console.log('\n');

  try {
    console.log('🚀 Creating student user...');
    const result = await createStudentUser(userData);
    
    console.log('✅ Student user created successfully!');
    console.log('\n📋 Response:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error creating student user:', error.message);
    process.exit(1);
  }
}

// Run the script
main(); 