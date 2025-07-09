#!/bin/bash

# Complete Staging Deployment Script
# This script handles the full deployment process for staging environment

set -e

echo "🚀 Starting complete staging deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

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

# Configuration
ENVIRONMENT="staging"
API_ENVIRONMENT="api-staging"
DATABASE_NAME="cruiser-db-staging"
BUCKET_NAME="cruiser-storage-staging"

# Check if wrangler is installed
if ! command -v npx &> /dev/null; then
    print_error "npx is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_ACCOUNT_ID" ] || [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    print_error "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set"
    echo "Please set these environment variables:"
    echo "export CLOUDFLARE_ACCOUNT_ID='your-account-id'"
    echo "export CLOUDFLARE_API_TOKEN='your-api-token'"
    exit 1
fi

# Step 1: Build the project
print_header "Step 1: Building Project"
print_status "Installing dependencies..."
npm ci

print_status "Building frontend..."
cd packages/frontend
npm run build
cd ../..

# Step 2: Generate KV data
print_header "Step 2: Generating KV Data"
print_status "Generating KV data..."
cd packages/frontend
node scripts/upload-kv.js
cd ../..

# Step 3: Setup R2 Bucket
print_header "Step 3: Setting up R2 Bucket"
./scripts/setup-staging-r2.sh

# Step 4: Deploy D1 Database
print_header "Step 4: Deploying D1 Database"
./scripts/deploy-staging-db.sh

# Step 5: Upload KV Data
print_header "Step 5: Uploading KV Data"
print_status "Uploading KV data to staging..."
npx wrangler kv bulk put --binding=STATIC_CONTENT_STAGING --env "$ENVIRONMENT" packages/frontend/kv-data.json
print_success "KV data uploaded successfully"

# Step 6: Deploy API Worker
print_header "Step 6: Deploying API Worker"
print_status "Deploying API worker to staging..."
npx wrangler@4 deploy --env "$API_ENVIRONMENT"
print_success "API worker deployed successfully"

# Step 7: Deploy Frontend Worker
print_header "Step 7: Deploying Frontend Worker"
print_status "Deploying frontend worker to staging..."
npx wrangler@4 deploy --env "$ENVIRONMENT"
print_success "Frontend worker deployed successfully"

# Step 8: Verify Deployment
print_header "Step 8: Verifying Deployment"
print_status "Waiting for deployment to stabilize..."
sleep 15

# Test API health
print_status "Testing API health..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://cruiser-aviation-api-staging.julian-pad.workers.dev/health || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    print_success "API health check passed"
else
    print_warning "API health check failed (HTTP $API_RESPONSE)"
fi

# Test frontend
print_status "Testing frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://cruiser-aviation-frontend-staging.julian-pad.workers.dev/ || echo "000")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    print_success "Frontend health check passed"
else
    print_warning "Frontend health check failed (HTTP $FRONTEND_RESPONSE)"
fi

# Final summary
print_header "Deployment Complete!"
print_success "Staging deployment completed successfully!"
echo ""
echo "🌍 Deployment URLs:"
echo "  - Frontend: https://cruiser-aviation-frontend-staging.julian-pad.workers.dev"
echo "  - API: https://cruiser-aviation-api-staging.julian-pad.workers.dev"
echo ""
echo "📊 Deployment Summary:"
echo "  - ✅ R2 bucket configured"
echo "  - ✅ D1 Database schema deployed"
echo "  - ✅ D1 Database seeded with sample data"
echo "  - ✅ KV namespace populated"
echo "  - ✅ API Worker deployed"
echo "  - ✅ Frontend Worker deployed"
echo ""
echo "🔧 Environment Details:"
echo "  - Database: $DATABASE_NAME"
echo "  - Storage: $BUCKET_NAME"
echo "  - Cache: CACHE_STAGING KV namespace"
echo ""
echo "📝 Next Steps:"
echo "  1. Test the staging environment"
echo "  2. Verify all functionality works as expected"
echo "  3. Deploy to production when ready" 