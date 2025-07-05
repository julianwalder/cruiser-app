#!/bin/bash

# Cruiser Aviation Workers Deployment Script
# This script deploys both frontend and API workers to staging and production

set -e  # Exit on any error

echo "🚀 Starting Cruiser Aviation Workers Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if wrangler is installed
if ! command -v npx wrangler &> /dev/null; then
    print_error "Wrangler CLI is not installed. Please install it first."
    exit 1
fi

# Function to deploy API worker
deploy_api() {
    local environment=$1
    print_status "Deploying API worker to $environment..."
    
    cd packages/backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Build the project
    print_status "Building backend..."
    npm run build
    
    # Deploy to environment
    print_status "Deploying API worker to $environment..."
    npx wrangler deploy --env api-$environment
    
    cd ../..
    print_success "API worker deployed to $environment successfully!"
}

# Function to deploy frontend worker
deploy_frontend() {
    local environment=$1
    print_status "Deploying frontend worker to $environment..."
    
    cd packages/frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Build the project
    print_status "Building frontend..."
    npm run build
    
    # Deploy to environment
    print_status "Deploying frontend worker to $environment..."
    npx wrangler deploy --env $environment
    
    cd ../..
    print_success "Frontend worker deployed to $environment successfully!"
}

# Function to run database migration
migrate_database() {
    local environment=$1
    print_status "Running database migration for $environment..."
    
    cd packages/backend
    npm run db:migrate:$environment
    cd ../..
    
    print_success "Database migration completed for $environment!"
}

# Function to test deployment
test_deployment() {
    local environment=$1
    local api_url=""
    
    if [ "$environment" = "staging" ]; then
        api_url="https://staging-api.cruiseraviation.com"
    else
        api_url="https://api.cruiseraviation.com"
    fi
    
    print_status "Testing deployment for $environment..."
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    if curl -f -s "$api_url/health" > /dev/null; then
        print_success "Health check passed for $environment"
    else
        print_error "Health check failed for $environment"
        return 1
    fi
    
    # Test magic link endpoint
    print_status "Testing magic link endpoint..."
    if curl -f -s -X POST "$api_url/api/auth/magic-link" \
        -H "Content-Type: application/json" \
        -d '{"email": "test@example.com"}' > /dev/null; then
        print_success "Magic link endpoint test passed for $environment"
    else
        print_error "Magic link endpoint test failed for $environment"
        return 1
    fi
}

# Main deployment logic
main() {
    local target_env=${1:-"staging"}
    
    if [ "$target_env" != "staging" ] && [ "$target_env" != "production" ]; then
        print_error "Invalid environment. Use 'staging' or 'production'"
        exit 1
    fi
    
    print_status "Starting deployment to $target_env environment..."
    
    # Step 1: Deploy API worker
    deploy_api $target_env
    
    # Step 2: Deploy frontend worker
    deploy_frontend $target_env
    
    # Step 3: Test deployment
    test_deployment $target_env
    
    print_success "🎉 Deployment to $target_env completed successfully!"
    
    if [ "$target_env" = "staging" ]; then
        echo ""
        print_status "Staging URLs:"
        echo "  Frontend: https://cruiser-aviation-frontend-staging.julian-pad.workers.dev"
        echo "  API: https://staging-api.cruiseraviation.com"
    else
        echo ""
        print_status "Production URLs:"
        echo "  Frontend: https://cruiseraviation.com"
        echo "  API: https://api.cruiseraviation.com"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [staging|production]"
    echo ""
    echo "Options:"
    echo "  staging     Deploy to staging environment (default)"
    echo "  production  Deploy to production environment"
    echo ""
    echo "Examples:"
    echo "  $0 staging     # Deploy to staging"
    echo "  $0 production  # Deploy to production"
}

# Check command line arguments
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_usage
    exit 0
fi

# Run main function
main "$@" 