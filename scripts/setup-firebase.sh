#!/bin/bash

# Firebase Setup Script for Cruiser Aviation Platform
# This script helps configure Firebase credentials from a JSON key file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if jq is installed
check_jq() {
    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed. Please install jq first:"
        echo "  macOS: brew install jq"
        echo "  Ubuntu: sudo apt-get install jq"
        echo "  CentOS: sudo yum install jq"
        exit 1
    fi
}

# Function to extract Firebase config from JSON
extract_firebase_config() {
    local json_file="$1"
    
    print_status "Extracting Firebase configuration from $json_file..."
    
    # Extract backend Firebase Admin SDK credentials
    FIREBASE_PROJECT_ID=$(jq -r '.project_id' "$json_file")
    FIREBASE_PRIVATE_KEY=$(jq -r '.private_key' "$json_file" | sed 's/\\n/\n/g')
    FIREBASE_CLIENT_EMAIL=$(jq -r '.client_email' "$json_file")
    
    # Extract frontend Firebase config
    FIREBASE_API_KEY=$(jq -r '.api_key // empty' "$json_file")
    FIREBASE_AUTH_DOMAIN=$(jq -r '.auth_domain // empty' "$json_file")
    FIREBASE_STORAGE_BUCKET=$(jq -r '.storage_bucket // empty' "$json_file")
    FIREBASE_MESSAGING_SENDER_ID=$(jq -r '.messaging_sender_id // empty' "$json_file")
    FIREBASE_APP_ID=$(jq -r '.app_id // empty' "$json_file")
    
    # Validate required fields
    if [ -z "$FIREBASE_PROJECT_ID" ] || [ "$FIREBASE_PROJECT_ID" = "null" ]; then
        print_error "project_id not found in Firebase JSON file"
        exit 1
    fi
    
    if [ -z "$FIREBASE_PRIVATE_KEY" ] || [ "$FIREBASE_PRIVATE_KEY" = "null" ]; then
        print_error "private_key not found in Firebase JSON file"
        exit 1
    fi
    
    if [ -z "$FIREBASE_CLIENT_EMAIL" ] || [ "$FIREBASE_CLIENT_EMAIL" = "null" ]; then
        print_error "client_email not found in Firebase JSON file"
        exit 1
    fi
    
    print_success "Firebase configuration extracted successfully"
}

# Function to update backend environment file
update_backend_env() {
    local env_file="packages/backend/.env"
    
    print_status "Updating backend environment file..."
    
    # Create .env file if it doesn't exist
    if [ ! -f "$env_file" ]; then
        cp packages/backend/env.example "$env_file"
        print_status "Created $env_file from example"
    fi
    
    # Update Firebase configuration
    sed -i.bak "s/FIREBASE_PROJECT_ID=.*/FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID/" "$env_file"
    
    # Handle private key with proper escaping
    # First, remove the existing private key line
    sed -i.bak "/FIREBASE_PRIVATE_KEY=/d" "$env_file"
    # Then add the new private key line
    echo "FIREBASE_PRIVATE_KEY=\"$FIREBASE_PRIVATE_KEY\"" >> "$env_file"
    
    sed -i.bak "s/FIREBASE_CLIENT_EMAIL=.*/FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL/" "$env_file"
    
    # Remove backup file
    rm -f "${env_file}.bak"
    
    print_success "Backend environment file updated"
}

# Function to update frontend environment file
update_frontend_env() {
    local env_file="packages/frontend/.env"
    
    print_status "Updating frontend environment file..."
    
    # Create .env file if it doesn't exist
    if [ ! -f "$env_file" ]; then
        cat > "$env_file" << EOF
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
EOF
        print_status "Created $env_file"
    fi
    
    # Update Firebase configuration if values exist
    if [ -n "$FIREBASE_API_KEY" ] && [ "$FIREBASE_API_KEY" != "null" ]; then
        sed -i.bak "s/VITE_FIREBASE_API_KEY=.*/VITE_FIREBASE_API_KEY=$FIREBASE_API_KEY/" "$env_file"
    fi
    
    if [ -n "$FIREBASE_AUTH_DOMAIN" ] && [ "$FIREBASE_AUTH_DOMAIN" != "null" ]; then
        sed -i.bak "s/VITE_FIREBASE_AUTH_DOMAIN=.*/VITE_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN/" "$env_file"
    fi
    
    if [ -n "$FIREBASE_PROJECT_ID" ] && [ "$FIREBASE_PROJECT_ID" != "null" ]; then
        sed -i.bak "s/VITE_FIREBASE_PROJECT_ID=.*/VITE_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID/" "$env_file"
    fi
    
    if [ -n "$FIREBASE_STORAGE_BUCKET" ] && [ "$FIREBASE_STORAGE_BUCKET" != "null" ]; then
        sed -i.bak "s/VITE_FIREBASE_STORAGE_BUCKET=.*/VITE_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET/" "$env_file"
    fi
    
    if [ -n "$FIREBASE_MESSAGING_SENDER_ID" ] && [ "$FIREBASE_MESSAGING_SENDER_ID" != "null" ]; then
        sed -i.bak "s/VITE_FIREBASE_MESSAGING_SENDER_ID=.*/VITE_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID/" "$env_file"
    fi
    
    if [ -n "$FIREBASE_APP_ID" ] && [ "$FIREBASE_APP_ID" != "null" ]; then
        sed -i.bak "s/VITE_FIREBASE_APP_ID=.*/VITE_FIREBASE_APP_ID=$FIREBASE_APP_ID/" "$env_file"
    fi
    
    # Remove backup file
    rm -f "${env_file}.bak"
    
    print_success "Frontend environment file updated"
}

# Function to create production environment file
create_production_env() {
    local prod_env_file=".env.production"
    
    print_status "Creating production environment file..."
    
    cat > "$prod_env_file" << EOF
# Production Environment Variables for Cruiser Aviation Platform

# Database
POSTGRES_DB=cruiser_aviation
POSTGRES_USER=cruiser_user
POSTGRES_PASSWORD=your-secure-database-password

# Redis
REDIS_PASSWORD=your-secure-redis-password

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

# Firebase (Backend)
FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY="$FIREBASE_PRIVATE_KEY"
FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL

# Firebase (Frontend)
FIREBASE_API_KEY=$FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN
FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID=$FIREBASE_APP_ID

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-storage-bucket-name

# SmartBill
SMARTBILL_API_KEY=your-smartbill-api-key
SMARTBILL_COMPANY_VAT=your-company-vat-number
SMARTBILL_COMPANY_NAME=Your Company Name
SMARTBILL_COMPANY_ADDRESS=Your Company Address

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EOF
    
    print_success "Production environment file created: $prod_env_file"
    print_warning "Please review and update the remaining environment variables in $prod_env_file"
}

# Function to show next steps
show_next_steps() {
    print_success "Firebase setup completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review and update the remaining environment variables in .env.production"
    echo "2. Set up SSL certificates in nginx/ssl/"
    echo "3. Deploy to production:"
    echo "   ./scripts/deploy.sh production your-domain.com"
    echo ""
    echo "🔐 Security notes:"
    echo "- Keep your Firebase JSON file secure and never commit it to version control"
    echo "- Use strong passwords for database and Redis"
    echo "- Rotate JWT secrets regularly"
    echo "- Enable Firebase App Check for additional security"
    echo ""
    echo "📚 Documentation:"
    echo "- Backend .env: packages/backend/.env"
    echo "- Frontend .env: packages/frontend/.env"
    echo "- Production .env: .env.production"
}

# Main function
main() {
    print_status "Setting up Firebase configuration for Cruiser Aviation Platform"
    
    # Check if JSON file is provided
    if [ $# -eq 0 ]; then
        print_error "Please provide the path to your Firebase JSON key file"
        echo "Usage: $0 <path-to-firebase-key.json>"
        echo "Example: $0 ./firebase-service-account.json"
        exit 1
    fi
    
    local json_file="$1"
    
    # Check if file exists
    if [ ! -f "$json_file" ]; then
        print_error "Firebase JSON file not found: $json_file"
        exit 1
    fi
    
    # Check if jq is installed
    check_jq
    
    # Extract Firebase configuration
    extract_firebase_config "$json_file"
    
    # Update environment files
    update_backend_env
    update_frontend_env
    create_production_env
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@" 