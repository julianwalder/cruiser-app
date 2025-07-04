#!/bin/bash

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."

# Navigate to frontend directory
cd packages/frontend

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Deploy to Cloudflare Pages
echo "📦 Building and deploying..."
wrangler pages deploy dist --project-name=cruiser-aviation-frontend --branch=main

echo "✅ Deployment completed!"
echo "🌐 Your site should be available at: https://cruiser-aviation-frontend.pages.dev" 