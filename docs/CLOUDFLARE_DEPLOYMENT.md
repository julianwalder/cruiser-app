# Cloudflare Workers Deployment Guide

## Overview
This guide explains how to deploy the Cruiser Aviation frontend to Cloudflare Workers using their serverless platform. This approach provides better performance, lower latency, and more control over your application.

## Prerequisites
- Cloudflare account
- Wrangler CLI installed
- Node.js and npm

## Setup Instructions

### 1. Install Dependencies

First, install the required dependencies:

```bash
cd packages/frontend
npm install
```

### 2. Configure Wrangler

1. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

2. **Update Environment Variables**:
   Edit `packages/frontend/wrangler.toml` and update the environment variables:
   ```toml
   [[env.production.vars]]
   name = "VITE_API_URL"
   value = "https://your-production-api.com"
   
   [[env.staging.vars]]
   name = "VITE_API_URL"
   value = "https://your-staging-api.com"
   ```

### 3. Deploy to Cloudflare Workers

#### Development Deployment
```bash
npm run deploy:dev
```

#### Staging Deployment
```bash
npm run deploy:staging
```

#### Production Deployment
```bash
npm run deploy:production
```

### 4. Using the Deployment Script

Alternatively, you can use the deployment script:

```bash
# From the root directory
./scripts/deploy-worker.sh production
./scripts/deploy-worker.sh staging
./scripts/deploy-worker.sh
```

## How It Works

### Worker Architecture
The Cloudflare Worker (`src/worker.ts`) serves your React SPA by:

1. **Static Asset Serving**: Serves built assets (JS, CSS, images) with optimal caching
2. **SPA Routing**: Handles client-side routing by serving `index.html` for non-asset requests
3. **Edge Caching**: Leverages Cloudflare's global edge network for fast delivery
4. **Environment Variables**: Injects build-time environment variables

### Benefits of Workers over Pages

1. **Better Performance**: Workers run at the edge, closer to users
2. **More Control**: Custom routing and caching logic
3. **Lower Latency**: Direct edge execution
4. **Cost Effective**: Pay-per-request model
5. **Global Distribution**: Automatic global deployment

### Environment Variables

The worker supports different environments:
- **Development**: Basic configuration for local testing
- **Staging**: Pre-production environment with staging API
- **Production**: Live environment with production API

### Custom Domains

To use a custom domain:

1. **Add Custom Domain in Cloudflare Dashboard**:
   - Go to Workers & Pages
   - Select your worker
   - Add custom domain

2. **Update DNS Records**:
   - Point your domain to Cloudflare's nameservers
   - Create CNAME record pointing to your worker

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clean and rebuild
   rm -rf dist node_modules
   npm install
   npm run build
   ```

2. **Deployment Errors**:
   ```bash
   # Check wrangler configuration
   wrangler whoami
   wrangler config
   ```

3. **Environment Variables Not Working**:
   - Ensure variables are properly set in `wrangler.toml`
   - Rebuild and redeploy after changes

### Development Workflow

1. **Local Development**:
   ```bash
   npm run dev
   ```

2. **Worker Development**:
   ```bash
   npm run worker:dev
   ```

3. **Testing Deployment**:
   ```bash
   npm run deploy:staging
   ```

## Monitoring and Analytics

### Cloudflare Analytics
- View worker performance in Cloudflare Dashboard
- Monitor request volume and response times
- Track error rates and edge locations

### Custom Monitoring
Add custom headers or logging to track specific metrics:

```typescript
// In worker.ts
response.headers.set('X-Cache-Status', 'HIT')
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **CORS**: Configure CORS headers for API requests
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Authentication**: Ensure proper authentication for admin routes

## Performance Optimization

1. **Asset Caching**: Static assets are cached for 1 year
2. **HTML Caching**: HTML files cached for 1 hour
3. **Compression**: Automatic gzip compression
4. **CDN**: Global edge distribution

## Cost Optimization

1. **Request Volume**: Monitor request counts
2. **CPU Time**: Optimize worker execution time
3. **Bandwidth**: Compress assets and optimize images
4. **KV Storage**: Use KV for dynamic data if needed 