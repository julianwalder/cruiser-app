#!/bin/bash

# Deploy to Cloudflare Workers Staging Environment
# This script deploys the frontend to staging environment

set -e

echo "🚀 Deploying to Cloudflare Workers Staging Environment..."

# Check if we're on the dev branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "dev" ]; then
    echo "❌ Error: You must be on the 'dev' branch to deploy to staging"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Please run: git checkout dev"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes"
    echo "Please commit or stash your changes before deploying"
    git status --short
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to staging environment
echo "🌐 Deploying to staging environment..."
npx wrangler deploy --env staging

echo "✅ Successfully deployed to staging environment!"
echo "🌍 Staging URL: https://cruiser-aviation-frontend-staging.your-subdomain.workers.dev"
echo ""
echo "📋 Next steps:"
echo "1. Test the staging environment"
echo "2. If everything looks good, merge dev to master"
echo "3. Deploy to production using: npm run deploy:production" 