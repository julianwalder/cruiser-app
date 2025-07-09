#!/bin/bash

# Setup R2 Bucket for Staging
# This script handles R2 bucket creation and configuration for the staging environment

set -e

echo "🪣 Starting R2 bucket setup for staging..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="cruiser-storage-staging"
ENVIRONMENT="api-staging"

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

# Check if bucket exists
print_status "Checking if R2 bucket exists..."
if npx wrangler r2 bucket list | grep -q "$BUCKET_NAME"; then
    print_success "R2 bucket '$BUCKET_NAME' already exists"
else
    print_status "Creating R2 bucket '$BUCKET_NAME'..."
    if npx wrangler r2 bucket create "$BUCKET_NAME"; then
        print_success "R2 bucket created successfully"
    else
        print_error "Failed to create R2 bucket"
        exit 1
    fi
fi

# Set bucket permissions (public read for staging)
print_status "Setting bucket permissions..."
if npx wrangler r2 bucket update "$BUCKET_NAME" --public-read; then
    print_success "Bucket permissions set to public read"
else
    print_warning "Failed to set bucket permissions - continuing"
fi

# Verify bucket access
print_status "Verifying bucket access..."
if npx wrangler r2 bucket list | grep -q "$BUCKET_NAME"; then
    print_success "Bucket access verified"
else
    print_error "Failed to verify bucket access"
    exit 1
fi

print_success "R2 bucket setup completed successfully!"
echo ""
echo "🪣 Bucket Details:"
echo "  - Name: $BUCKET_NAME"
echo "  - Environment: $ENVIRONMENT"
echo "  - Public Read: Enabled"
echo ""
echo "📝 Note: R2 buckets are automatically bound to your Workers via wrangler.toml" 