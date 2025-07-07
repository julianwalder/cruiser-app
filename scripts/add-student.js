#!/usr/bin/env node

/**
 * Interactive script to add a new student user
 * Usage: node scripts/add-student.js
 */

import { createInterface } from 'readline';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to generate a random UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Function to prompt for user input
function askQuestion(rl, question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Function to generate SQL insert statement
function generateSQLInsert(userData) {
  const columns = Object.keys(userData);
  const values = Object.values(userData).map(value => {
    if (value === null || value === undefined || value === '') {
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

// Main function
async function main() {
  console.log('🎓 Add New Student User');
  console.log('=======================\n');

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Collect user information
    const email = await askQuestion(rl, 'Email address', 'student@example.com');
    const firstName = await askQuestion(rl, 'First name', 'John');
    const lastName = await askQuestion(rl, 'Last name', 'Student');
    const phoneNumber = await askQuestion(rl, 'Phone number', '+1 (555) 123-4567');
    const dateOfBirth = await askQuestion(rl, 'Date of birth (YYYY-MM-DD)', '1995-01-15');
    const address = await askQuestion(rl, 'Address', '123 Student Street');
    const city = await askQuestion(rl, 'City', 'Student City');
    const region = await askQuestion(rl, 'Region/State', 'Student Region');
    const country = await askQuestion(rl, 'Country', 'United States');
    const postalCode = await askQuestion(rl, 'Postal code', '12345');
    const nationality = await askQuestion(rl, 'Nationality', 'American');
    const sex = await askQuestion(rl, 'Sex', 'Not specified');

    rl.close();

    // Create user data
    const userData = {
      id: generateUUID(),
      email,
      firstName,
      lastName,
      phoneNumber,
      role: 'user', // Student role
      status: 'active',
      dateOfBirth: dateOfBirth || null,
      address: address || null,
      city: city || null,
      region: region || null,
      country: country || null,
      postalCode: postalCode || null,
      nationality: nationality || null,
      sex: sex || null,
      totalFlightHours: 0,
      creditedHours: 0,
      isIdVerified: false,
      isMedicalVerified: false,
      isPhoneVerified: false,
      isEmailVerified: false,
      hasPPL: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('\n📋 Student User Data:');
    console.log(JSON.stringify(userData, null, 2));
    console.log('\n');

    // Generate SQL insert statement
    const sqlInsert = generateSQLInsert(userData);
    console.log('🗄️  SQL Insert Statement:');
    console.log(sqlInsert);
    console.log('\n');

    // Save to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `student-${email.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.sql`;
    const filepath = join(__dirname, filename);
    
    writeFileSync(filepath, sqlInsert);
    console.log(`💾 SQL saved to: ${filepath}`);

    console.log('\n✅ Student user data generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the SQL insert statement in your database');
    console.log('2. Configure Cloudflare Access for the new user');
    console.log('3. Set up authentication credentials');
    console.log('4. Update any necessary permissions or roles');

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
main(); 