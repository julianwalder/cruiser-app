#!/bin/bash

# Example Firebase Setup for Cruiser Aviation Platform
# This script demonstrates how to use the Firebase setup script

echo "🚀 Firebase Setup Example for Cruiser Aviation Platform"
echo "======================================================"
echo ""

echo "📋 Prerequisites:"
echo "1. Firebase project created in Firebase Console"
echo "2. Service account JSON key file downloaded"
echo "3. jq command-line tool installed"
echo ""

echo "🔧 Installing jq (if not already installed):"
echo "  macOS: brew install jq"
echo "  Ubuntu: sudo apt-get install jq"
echo "  CentOS: sudo yum install jq"
echo ""

echo "📁 Your Firebase JSON file should look like this:"
cat << 'EOF'
{
  "type": "service_account",
  "project_id": "cruiser-aviation-12345",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@cruiser-aviation-12345.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40cruiser-aviation-12345.iam.gserviceaccount.com"
}
EOF
echo ""

echo "🚀 Running the Firebase setup script:"
echo "  ./scripts/setup-firebase.sh /path/to/your/firebase-key.json"
echo ""

echo "📝 What the script will do:"
echo "  ✓ Extract Firebase configuration from JSON"
echo "  ✓ Update packages/backend/.env with Admin SDK credentials"
echo "  ✓ Update packages/frontend/.env with client-side config"
echo "  ✓ Create .env.production with all environment variables"
echo "  ✓ Validate required fields are present"
echo ""

echo "🔐 Security notes:"
echo "  - Keep your Firebase JSON file secure"
echo "  - Never commit it to version control"
echo "  - Use environment variables in production"
echo ""

echo "📖 For detailed instructions, see: docs/FIREBASE_SETUP.md"
echo ""

echo "🎯 Next steps after running the setup script:"
echo "1. Review .env.production and update remaining API keys"
echo "2. Set up SSL certificates in nginx/ssl/"
echo "3. Deploy to production: ./scripts/deploy.sh production your-domain.com"
echo ""

echo "✅ Ready to set up Firebase! Run the setup script with your JSON file." 