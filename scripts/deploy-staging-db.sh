#!/bin/bash

# Deploy D1 Database to Staging
# This script handles database schema deployment and seeding for the staging environment

set -e

echo "🚀 Starting D1 database deployment to staging..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DATABASE_NAME="cruiser-db-staging"
ENVIRONMENT="api-staging"
SCHEMA_FILE="packages/frontend/schema.sql"
SEED_FILE="packages/frontend/seed.sql"

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

# Check if required files exist
if [ ! -f "$SCHEMA_FILE" ]; then
    print_error "Schema file not found: $SCHEMA_FILE"
    exit 1
fi

if [ ! -f "$SEED_FILE" ]; then
    print_warning "Seed file not found: $SEED_FILE - skipping seeding"
    SEED_FILE=""
fi

# Deploy schema
print_status "Deploying database schema..."
if npx wrangler d1 execute "$DATABASE_NAME" --env "$ENVIRONMENT" --file="$SCHEMA_FILE"; then
    print_success "Database schema deployed successfully"
else
    print_error "Failed to deploy database schema"
    exit 1
fi

# Seed database if seed file exists
if [ -n "$SEED_FILE" ]; then
    print_status "Seeding database with sample data..."
    if npx wrangler d1 execute "$DATABASE_NAME" --env "$ENVIRONMENT" --file="$SEED_FILE"; then
        print_success "Database seeded successfully"
    else
        print_warning "Failed to seed database - continuing deployment"
    fi
fi

# Verify database connection
print_status "Verifying database connection..."
if npx wrangler d1 execute "$DATABASE_NAME" --env "$ENVIRONMENT" --command="SELECT 1 as test"; then
    print_success "Database connection verified"
else
    print_error "Failed to verify database connection"
    exit 1
fi

print_success "D1 database deployment completed successfully!"
echo ""
echo "📊 Database Details:"
echo "  - Name: $DATABASE_NAME"
echo "  - Environment: $ENVIRONMENT"
echo "  - Schema: $SCHEMA_FILE"
if [ -n "$SEED_FILE" ]; then
    echo "  - Seed: $SEED_FILE"
fi 