#!/bin/bash

# Deploy to Cloudflare Workers
echo "🚀 Deploying to Cloudflare Workers..."

# Navigate to frontend directory
cd packages/frontend

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Build the project first
echo "📦 Building project..."
npm run build

# Deploy based on environment
if [ "$1" = "production" ]; then
    echo "🚀 Deploying to production..."
    wrangler deploy --env production
elif [ "$1" = "staging" ]; then
    echo "🚀 Deploying to staging..."
    wrangler deploy --env staging
else
    echo "🚀 Deploying to development..."
    wrangler deploy
fi

echo "✅ Deployment completed!"
echo "🌐 Your worker should be available at: https://cruiser-aviation-frontend.your-subdomain.workers.dev" 