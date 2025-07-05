# Cloudflare Workers Backend Deployment Guide

## Overview

This guide covers deploying the new Cloudflare Workers backend that replaces the NestJS backend. The new backend is built with Hono.js and runs entirely on Cloudflare's edge network.

## Prerequisites

1. **Cloudflare Account** with Workers, D1, R2, and KV access
2. **Wrangler CLI** installed and authenticated
3. **Node.js** 18+ installed

## Architecture

```
Frontend Worker → API Worker → Cloudflare Services
├── Static Assets (KV)
├── File Storage (R2) 
├── Database (D1)
└── Authentication (Cloudflare Access)
```

## Step 1: Install Dependencies

```bash
# Install backend dependencies
cd packages/backend
npm install

# Install root dependencies
cd ../..
npm install
```

## Step 2: Database Setup

### Create D1 Database (if not exists)

```bash
# Create staging database
npx wrangler d1 create cruiser-db-staging

# Create production database  
npx wrangler d1 create cruiser-db-production
```

### Run Database Migration

```bash
# Migrate staging database
npm run db:migrate:staging

# Migrate production database
npm run db:migrate:production
```

## Step 3: Configure Environment Variables

Update `wrangler.toml` with your actual values:

```toml
[env.api-staging.vars]
JWT_SECRET = "your-actual-jwt-secret-here"
CLOUDFLARE_ACCESS_AUD = "https://staging.cruiseraviation.com"

[env.api.vars]
JWT_SECRET = "your-actual-jwt-secret-here"
CLOUDFLARE_ACCESS_AUD = "https://cruiseraviation.com"
```

## Step 4: Deploy API Worker

### Deploy to Staging

```bash
# Deploy API worker to staging
npm run deploy:api:staging
```

### Deploy to Production

```bash
# Deploy API worker to production
npm run deploy:api:production
```

## Step 5: Configure Custom Domains

### Staging Domain

1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Select your staging API worker
4. Go to Settings → Triggers
5. Add custom domain: `staging-api.cruiseraviation.com`

### Production Domain

1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Select your production API worker
4. Go to Settings → Triggers
5. Add custom domain: `api.cruiseraviation.com`

## Step 6: Update Frontend Configuration

Update the frontend API URLs in `wrangler.toml`:

```toml
[env.staging.vars]
VITE_API_URL = "https://staging-api.cruiseraviation.com"

[env.production.vars]
VITE_API_URL = "https://api.cruiseraviation.com"
```

## Step 7: Deploy Frontend

```bash
# Deploy frontend to staging
npm run deploy:staging

# Deploy frontend to production
npm run deploy:production
```

## Step 8: Test the Deployment

### Health Check

```bash
# Test staging API
curl https://staging-api.cruiseraviation.com/health

# Test production API
curl https://api.cruiseraviation.com/health
```

### Authentication Test

```bash
# Test magic link endpoint
curl -X POST https://staging-api.cruiseraviation.com/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## File Upload Configuration

### R2 Bucket Setup

1. Create R2 buckets in Cloudflare Dashboard
2. Configure CORS for file uploads
3. Update bucket names in `wrangler.toml`

### Upload Endpoints

- `POST /api/upload/aircraft` - Aircraft images and documents
- `POST /api/upload/base` - Base images
- `POST /api/upload/document` - General documents

## Cloudflare Access Integration

### Setup Access Application

1. Go to Cloudflare Access
2. Create new application
3. Configure authentication methods
4. Set up policies for admin vs user access

### Update Environment Variables

```toml
[env.api-staging.vars]
CLOUDFLARE_ACCESS_AUD = "your-access-aud-here"

[env.api.vars]
CLOUDFLARE_ACCESS_AUD = "your-access-aud-here"
```

## Monitoring and Logs

### View Worker Logs

```bash
# View staging logs
npm run worker:tail:staging

# View production logs
npm run worker:tail:production
```

### Monitor Performance

1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Select your worker
4. View Analytics tab

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify D1 database exists
   - Check database bindings in `wrangler.toml`
   - Run migrations again

2. **File Upload Failures**
   - Check R2 bucket permissions
   - Verify CORS configuration
   - Check file size limits

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check Cloudflare Access configuration
   - Validate magic link tokens

### Debug Commands

```bash
# Test local development
npm run worker:dev --env local

# Check worker configuration
npx wrangler whoami

# List all workers
npx wrangler list
```

## Rollback Plan

If issues occur, you can rollback:

1. **Database Rollback**: Use D1 backup/restore
2. **Worker Rollback**: Use Wrangler versions
3. **Frontend Rollback**: Deploy previous version

## Security Considerations

1. **JWT Secrets**: Use strong, unique secrets
2. **CORS**: Configure properly for your domains
3. **File Uploads**: Validate file types and sizes
4. **Rate Limiting**: Consider implementing rate limits
5. **Access Control**: Use Cloudflare Access for authentication

## Performance Optimization

1. **Caching**: Use KV for caching frequently accessed data
2. **Database Queries**: Optimize D1 queries with proper indexes
3. **File Storage**: Use R2 for efficient file serving
4. **CDN**: Leverage Cloudflare's global network

## Next Steps

1. **Monitoring**: Set up alerts and monitoring
2. **Backup**: Configure automated backups
3. **Scaling**: Monitor performance and scale as needed
4. **Features**: Add additional features like notifications, reporting, etc. 