#!/bin/bash

# Cloudflare Pages Deployment Script for Cruiser Aviation Frontend

set -e

echo "🚀 Starting Cloudflare Pages deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Build the project
echo "📦 Building the project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."

# Check if we're in production or staging
if [ "$1" = "production" ]; then
    echo "🚀 Deploying to production..."
    wrangler pages deploy dist --project-name cruiser-aviation-frontend --branch master
else
    echo "🧪 Deploying to staging..."
    wrangler pages deploy dist --project-name cruiser-aviation-frontend --branch dev
fi

echo "✅ Deployment completed successfully!"
echo "🌍 Your site is now live on Cloudflare Pages" 