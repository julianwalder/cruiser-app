#!/bin/bash

# Production Deployment Script for Cruiser Aviation Platform
# This script deploys the master branch to production environment (ca-prod)

set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_WORKER_NAME="ca-prod"
PRODUCTION_D1_DB_NAME="cruiser-db-production"
PRODUCTION_R2_BUCKET_NAME="cruiser-storage-production"
PRODUCTION_KV_NAMESPACE_NAME="cruiser-cache-production"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Worker Name: $PRODUCTION_WORKER_NAME"
echo "  D1 Database: $PRODUCTION_D1_DB_NAME"
echo "  R2 Bucket: $PRODUCTION_R2_BUCKET_NAME"
echo "  KV Namespace: $PRODUCTION_KV_NAMESPACE_NAME"

# Check if we're on the master branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${RED}❌ Error: Must be on 'master' branch to deploy to production${NC}"
    echo "Current branch: $CURRENT_BRANCH"
    exit 1
fi

echo -e "${GREEN}✅ Current branch: $CURRENT_BRANCH${NC}"

# Step 1: Create D1 database if it doesn't exist
echo -e "${BLUE}📊 Step 1: Setting up D1 database...${NC}"
if ! npx wrangler d1 list | grep -q "$PRODUCTION_D1_DB_NAME"; then
    echo "Creating D1 database: $PRODUCTION_D1_DB_NAME"
    npx wrangler d1 create "$PRODUCTION_D1_DB_NAME" --name "$PRODUCTION_D1_DB_NAME"
    
    # Get the database ID
    DB_ID=$(npx wrangler d1 list | grep "$PRODUCTION_D1_DB_NAME" | awk '{print $1}')
    echo "Database ID: $DB_ID"
    
    # Apply schema
    echo "Applying database schema..."
    npx wrangler d1 execute "$PRODUCTION_D1_DB_NAME" --file=packages/frontend/schema.sql
    
    # Seed with sample data if available
    if [ -f "packages/frontend/seed.sql" ]; then
        echo "Seeding database with sample data..."
        npx wrangler d1 execute "$PRODUCTION_D1_DB_NAME" --file=packages/frontend/seed.sql
    fi
    
    echo -e "${GREEN}✅ D1 database created and initialized${NC}"
else
    echo -e "${YELLOW}⚠️  D1 database already exists, skipping creation${NC}"
fi

# Step 2: Create R2 bucket if it doesn't exist
echo -e "${BLUE}🗄️  Step 2: Setting up R2 bucket...${NC}"
if ! npx wrangler r2 bucket list | grep -q "$PRODUCTION_R2_BUCKET_NAME"; then
    echo "Creating R2 bucket: $PRODUCTION_R2_BUCKET_NAME"
    npx wrangler r2 bucket create "$PRODUCTION_R2_BUCKET_NAME"
    echo -e "${GREEN}✅ R2 bucket created${NC}"
else
    echo -e "${YELLOW}⚠️  R2 bucket already exists, skipping creation${NC}"
fi

# Step 3: Create KV namespace if it doesn't exist
echo -e "${BLUE}🔑 Step 3: Setting up KV namespace...${NC}"
if ! npx wrangler kv:namespace list | grep -q "$PRODUCTION_KV_NAMESPACE_NAME"; then
    echo "Creating KV namespace: $PRODUCTION_KV_NAMESPACE_NAME"
    npx wrangler kv:namespace create "$PRODUCTION_KV_NAMESPACE_NAME"
    echo -e "${GREEN}✅ KV namespace created${NC}"
else
    echo -e "${YELLOW}⚠️  KV namespace already exists, skipping creation${NC}"
fi

# Step 4: Deploy the worker
echo -e "${BLUE}🚀 Step 4: Deploying worker to production...${NC}"
echo "Deploying to environment: production"
npx wrangler deploy --env production

echo -e "${GREEN}✅ Production deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Production URL: https://$PRODUCTION_WORKER_NAME.$PRODUCTION_WORKER_NAME.workers.dev${NC}" 