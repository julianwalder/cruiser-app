#!/bin/bash

# Deploy to Cloudflare Workers Production Environment
# This script deploys the frontend to production environment

set -e

echo "🚀 Deploying to Cloudflare Workers Production Environment..."

# Check if we're on the master branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo "❌ Error: You must be on the 'master' branch to deploy to production"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Please run: git checkout master"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes"
    echo "Please commit or stash your changes before deploying"
    git status --short
    exit 1
fi

# Confirm deployment
echo "⚠️  WARNING: You are about to deploy to PRODUCTION"
echo "This will affect live users. Are you sure? (y/N)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to production environment
echo "🌐 Deploying to production environment..."
npx wrangler deploy --env production

echo "✅ Successfully deployed to production environment!"
echo "🌍 Production URL: https://cruiser-aviation-frontend.your-subdomain.workers.dev"
echo ""
echo "📋 Deployment complete!"
echo "🎉 Your changes are now live in production" 