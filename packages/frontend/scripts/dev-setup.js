#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Development environment configuration
const devConfig = `# Development Environment Configuration
VITE_API_URL=http://localhost:8787
VITE_APP_NAME=Cruiser Aviation (Dev)
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
VITE_DEBUG=true

# Firebase Configuration (for auth)
VITE_FIREBASE_API_KEY=AIzaSyChijXhZBr7ycWKEQSK1bCdLSoQioKEurk
VITE_FIREBASE_AUTH_DOMAIN=cruiserapp-b8429.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cruiserapp-b8429
VITE_FIREBASE_STORAGE_BUCKET=cruiserapp-b8429.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=443919130210
VITE_FIREBASE_APP_ID=1:443919130210:web:b8a009ef9ca1ca4f433b3b
VITE_FIREBASE_MEASUREMENT_ID=G-BCDHQJ67Z0

# Cloudflare Access (disabled for development)
VITE_CLOUDFLARE_ACCESS_AUD=
VITE_CLOUDFLARE_ACCESS_TEAM_DOMAIN=
`;

// Write development environment file
const envPath = path.join(__dirname, '../.env.development');
fs.writeFileSync(envPath, devConfig);

console.log('✅ Development environment configured');
console.log('📁 Created .env.development file');
console.log('');
console.log('🚀 To start development:');
console.log('  1. npm run api:dev     # Start fast API server');
console.log('  2. npm run dev:simple  # Start frontend dev server');
console.log('');
console.log('📊 API will be available at: http://localhost:8787');
console.log('📱 Frontend will be available at: http://localhost:3000'); 