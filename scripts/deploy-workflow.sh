#!/bin/bash

# Deployment Workflow Script for Cruiser Aviation Platform
# This script helps with the complete workflow from dev to master deployment

set -e

echo "🚀 Cruiser Aviation Deployment Workflow"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
print_step "Current branch: $CURRENT_BRANCH"

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_error "You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

print_success "No uncommitted changes detected"

# Function to deploy to staging
deploy_to_staging() {
    print_step "Deploying to staging environment..."
    
    if [ "$CURRENT_BRANCH" != "dev" ]; then
        print_error "Must be on 'dev' branch to deploy to staging"
        exit 1
    fi
    
    # Push dev branch to trigger staging deployment
    print_step "Pushing dev branch to trigger staging deployment..."
    git push origin dev
    
    print_success "Dev branch pushed. Staging deployment will start automatically via GitHub Actions."
    print_step "Staging URL: https://ca-staging.ca-staging.workers.dev"
}

# Function to merge dev to master and deploy to production
deploy_to_production() {
    print_step "Deploying to production environment..."
    
    if [ "$CURRENT_BRANCH" != "dev" ]; then
        print_error "Must be on 'dev' branch to deploy to production"
        exit 1
    fi
    
    # Switch to master branch
    print_step "Switching to master branch..."
    git checkout master
    
    # Pull latest changes
    print_step "Pulling latest changes from master..."
    git pull origin master
    
    # Merge dev into master
    print_step "Merging dev into master..."
    git merge dev --no-ff -m "Merge dev into master for production deployment"
    
    # Push master branch to trigger production deployment
    print_step "Pushing master branch to trigger production deployment..."
    git push origin master
    
    # Switch back to dev
    print_step "Switching back to dev branch..."
    git checkout dev
    
    print_success "Master branch pushed. Production deployment will start automatically via GitHub Actions."
    print_step "Production URL: https://ca-prod.ca-prod.workers.dev"
}

# Function to show deployment status
show_status() {
    print_step "Deployment Status"
    echo ""
    echo "Staging (ca-staging):"
    echo "  - Triggered by: push to dev branch"
    echo "  - URL: https://ca-staging.ca-staging.workers.dev"
    echo "  - Database: cruiser-db-staging"
    echo "  - Storage: cruiser-storage-staging"
    echo ""
    echo "Production (ca-prod):"
    echo "  - Triggered by: push to master branch"
    echo "  - URL: https://ca-prod.ca-prod.workers.dev"
    echo "  - Database: cruiser-db-production"
    echo "  - Storage: cruiser-storage-production"
    echo ""
    echo "GitHub Actions Workflows:"
    echo "  - Staging: .github/workflows/deploy-staging.yml"
    echo "  - Production: .github/workflows/deploy-production.yml"
}

# Main menu
case "${1:-}" in
    "staging")
        deploy_to_staging
        ;;
    "production")
        deploy_to_production
        ;;
    "status")
        show_status
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [staging|production|status|help]"
        echo ""
        echo "Commands:"
        echo "  staging    - Deploy dev branch to staging environment"
        echo "  production - Merge dev to master and deploy to production"
        echo "  status     - Show deployment status and URLs"
        echo "  help       - Show this help message"
        echo ""
        echo "Workflow:"
        echo "  1. Make changes on dev branch"
        echo "  2. Run: $0 staging    (deploy to staging)"
        echo "  3. Test staging environment"
        echo "  4. Run: $0 production (deploy to production)"
        ;;
    *)
        echo "Usage: $0 [staging|production|status|help]"
        echo "Run '$0 help' for more information"
        exit 1
        ;;
esac 