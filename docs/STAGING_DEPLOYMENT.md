# Staging Deployment Guide

This guide covers the automated deployment of your Cruiser Aviation application to the staging environment, including D1 databases, R2 buckets, and KV namespaces.

## Overview

The staging deployment process automatically handles:
- ✅ **D1 Database**: Schema deployment and data seeding
- ✅ **R2 Bucket**: Storage bucket creation and configuration
- ✅ **KV Namespace**: Static content and cache management
- ✅ **API Worker**: Backend service deployment
- ✅ **Frontend Worker**: Frontend application deployment

## Prerequisites

### Required Environment Variables
```bash
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
export CLOUDFLARE_API_TOKEN="your-api-token"
```

### Required Permissions
Your Cloudflare API token needs the following permissions:
- **Account**: Cloudflare Workers:Edit
- **Account**: Cloudflare Workers Scripts:Edit
- **Account**: Cloudflare Workers Routes:Edit
- **Account**: Cloudflare D1:Edit
- **Account**: Cloudflare R2:Edit
- **Account**: Cloudflare KV:Edit

## Automated Deployment

### GitHub Actions (Recommended)

The staging environment is automatically deployed when you push to the `dev` or `staging` branches:

```bash
git push origin dev
```

The deployment workflow (`.github/workflows/deploy-staging.yml`) will:
1. Build the frontend application
2. Generate KV data
3. Setup R2 bucket for staging
4. Deploy D1 database schema and seed data
5. Upload KV data to staging
6. Deploy API worker
7. Deploy frontend worker
8. Verify deployment health

### Manual Deployment

You can also run the deployment manually using the provided scripts:

```bash
# Full staging deployment
./scripts/deploy-staging.sh

# Individual components
./scripts/setup-staging-r2.sh    # R2 bucket setup
./scripts/deploy-staging-db.sh   # D1 database deployment
```

## Environment Configuration

### Staging Environment Details

| Component | Name | Binding | Environment |
|-----------|------|---------|-------------|
| **D1 Database** | `cruiser-db-staging` | `DB` | `api-staging` |
| **R2 Bucket** | `cruiser-storage-staging` | `STORAGE` | `api-staging` |
| **KV Namespace** | `CACHE_STAGING` | `CACHE_STAGING` | `staging` |
| **API Worker** | `cruiser-aviation-api-staging` | - | `api-staging` |
| **Frontend Worker** | `cruiser-aviation-frontend-staging` | - | `staging` |

### URLs
- **Frontend**: https://cruiser-aviation-frontend-staging.julian-pad.workers.dev
- **API**: https://cruiser-aviation-api-staging.julian-pad.workers.dev

## Database Management

### Schema Deployment
The D1 database schema is automatically deployed from `packages/frontend/schema.sql`:

```sql
-- Example schema structure
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Data Seeding
Sample data is automatically seeded from `packages/frontend/seed.sql`:

```sql
-- Example seed data
INSERT OR IGNORE INTO users (id, email) VALUES 
('user-1', 'admin@cruiseraviation.com');
```

### Manual Database Operations

```bash
# Execute SQL file
npx wrangler d1 execute cruiser-db-staging --env api-staging --file=schema.sql

# Execute SQL command
npx wrangler d1 execute cruiser-db-staging --env api-staging --command="SELECT * FROM users"

# Export database
npx wrangler d1 export cruiser-db-staging --env api-staging --output=backup.sql

# Import database
npx wrangler d1 execute cruiser-db-staging --env api-staging --file=backup.sql
```

## Storage Management

### R2 Bucket Operations

```bash
# List buckets
npx wrangler r2 bucket list

# Create bucket
npx wrangler r2 bucket create cruiser-storage-staging

# Upload file
npx wrangler r2 object put cruiser-storage-staging/test.jpg --file=test.jpg

# List objects
npx wrangler r2 object list cruiser-storage-staging

# Delete object
npx wrangler r2 object delete cruiser-storage-staging/test.jpg
```

### R2 Bucket Permissions
The staging R2 bucket is configured with public read access for testing purposes.

## KV Namespace Management

### KV Operations

```bash
# List namespaces
npx wrangler kv namespace list

# Put key-value pair
npx wrangler kv put --binding=CACHE_STAGING --env staging key value

# Get value
npx wrangler kv get --binding=CACHE_STAGING --env staging key

# Bulk upload
npx wrangler kv bulk put --binding=CACHE_STAGING --env staging data.json

# Delete key
npx wrangler kv delete --binding=CACHE_STAGING --env staging key
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database status
npx wrangler d1 list

# Verify database binding
npx wrangler d1 execute cruiser-db-staging --env api-staging --command="SELECT 1"
```

#### 2. R2 Bucket Access Issues
```bash
# Check bucket permissions
npx wrangler r2 bucket list

# Verify bucket binding
npx wrangler r2 object list cruiser-storage-staging
```

#### 3. KV Namespace Issues
```bash
# Check namespace binding
npx wrangler kv namespace list

# Test KV access
npx wrangler kv put --binding=CACHE_STAGING --env staging test-key test-value
```

#### 4. Worker Deployment Failures
```bash
# Check worker status
npx wrangler tail --env api-staging

# View deployment logs
npx wrangler deployments list --env api-staging
```

### Health Checks

After deployment, verify the services are running:

```bash
# API health check
curl https://cruiser-aviation-api-staging.julian-pad.workers.dev/health

# Frontend health check
curl https://cruiser-aviation-frontend-staging.julian-pad.workers.dev/
```

## Monitoring

### Deployment Logs
- GitHub Actions logs are available in the repository's Actions tab
- Worker logs can be viewed with: `npx wrangler tail --env api-staging`

### Performance Monitoring
- Use Cloudflare Analytics to monitor performance
- Check Worker metrics in the Cloudflare dashboard

## Rollback

If a deployment fails or causes issues:

1. **Revert the code**: `git revert <commit-hash>`
2. **Redeploy**: Push the revert commit to trigger a new deployment
3. **Database rollback**: Use the export/import commands to restore previous state

## Best Practices

1. **Always test locally** before pushing to staging
2. **Monitor deployment logs** for any errors
3. **Verify health checks** after deployment
4. **Keep database backups** before major schema changes
5. **Use environment-specific configurations** for different environments

## Support

If you encounter issues with the deployment process:

1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check Cloudflare dashboard for resource status
4. Contact the development team for assistance 