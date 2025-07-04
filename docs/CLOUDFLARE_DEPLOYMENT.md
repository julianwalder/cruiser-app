# Cloudflare Pages Deployment Guide

## Overview
This guide explains how to deploy the Cruiser Aviation frontend to Cloudflare Pages using their direct GitHub integration and environment variables.

## Prerequisites
- Cloudflare account
- GitHub repository connected to Cloudflare
- Wrangler CLI (optional, for manual deployments)

## Setup Instructions

### 1. Connect GitHub Repository to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Choose **Connect to Git**
4. Select your GitHub repository: `julianwalder/cruiser-app`
5. Configure build settings:
   - **Framework preset**: None
   - **Build command**: `cd packages/frontend && npm run build`
   - **Build output directory**: `packages/frontend/dist`
   - **Root directory**: `/` (leave empty)

### 2. Configure Environment Variables

In your Cloudflare Pages project settings, add these environment variables:

#### Production Environment Variables:
```
VITE_API_URL=https://your-backend-api.com
VITE_APP_NAME=Cruiser Aviation
VITE_APP_VERSION=1.0.0
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_VERIFF_PUBLIC_KEY=your_veriff_public_key
```

#### Preview Environment Variables (for PR deployments):
```
VITE_API_URL=https://staging-backend-api.com
VITE_APP_NAME=Cruiser Aviation (Staging)
VITE_APP_VERSION=1.0.0
VITE_FIREBASE_API_KEY=your_staging_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_staging_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_staging_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_staging_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_staging_sender_id
VITE_FIREBASE_APP_ID=your_staging_app_id
VITE_VERIFF_PUBLIC_KEY=your_staging_veriff_public_key
```

### 3. Configure Build Settings

In your Cloudflare Pages project settings:

- **Node.js version**: 18
- **Build command**: `cd packages/frontend && npm ci && npm run build`
- **Build output directory**: `packages/frontend/dist`

### 4. Automatic Deployments

Once configured, Cloudflare Pages will automatically:
- Deploy to production when you push to `main` or `master` branch
- Create preview deployments for pull requests
- Use the appropriate environment variables for each environment

### 5. Manual Deployment (Optional)

If you want to deploy manually using the CLI:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy manually
./scripts/deploy-cloudflare.sh
```

## Benefits of This Approach

1. **Simplified Workflow**: No need for GitHub Actions
2. **Environment Variables**: Managed directly in Cloudflare
3. **Automatic Deployments**: Triggers on every push/PR
4. **Preview Deployments**: Automatic PR previews
5. **Better Performance**: Cloudflare's global CDN
6. **Cost Effective**: Free tier available

## Troubleshooting

### Build Failures
- Check that all environment variables are set
- Verify Node.js version is 18
- Ensure build command is correct

### Environment Variables Not Working
- Make sure variables are prefixed with `VITE_`
- Check that variables are set for the correct environment (Production/Preview)
- Restart the build after adding new variables

### Deployment Not Triggering
- Verify GitHub repository is connected
- Check that you're pushing to the correct branch
- Ensure Cloudflare Pages project is active

## URLs

After deployment, your site will be available at:
- **Production**: `https://cruiser-aviation-frontend.pages.dev`
- **Preview**: `https://[commit-hash].cruiser-aviation-frontend.pages.dev`

## Next Steps

1. Set up your backend API and update `VITE_API_URL`
2. Configure Firebase project and add credentials
3. Set up Veriff integration and add public key
4. Test the deployment with a small change 