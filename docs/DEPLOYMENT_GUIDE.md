# Cruiser Aviation Platform - Deployment Guide

This guide explains how to deploy the Cruiser Aviation Platform from development to production using the automated deployment pipeline.

## 🏗️ Architecture Overview

The platform uses a multi-environment deployment strategy:

- **Local Development**: `api-local` environment for local testing
- **Staging**: `ca-staging` environment for pre-production testing
- **Production**: `ca-prod` environment for live deployment

## 📋 Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with Workers, D1, and R2 enabled
2. **GitHub Repository**: Code must be in a GitHub repository
3. **GitHub Secrets**: Configure the following secrets in your GitHub repository:
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with appropriate permissions

## 🚀 Deployment Workflow

### 1. Development Workflow

1. **Make changes on dev branch**:
   ```bash
   git checkout dev
   # Make your changes
   git add .
   git commit -m "Your commit message"
   ```

2. **Deploy to staging**:
   ```bash
   ./scripts/deploy-workflow.sh staging
   ```
   This will:
   - Push the dev branch to GitHub
   - Trigger automatic staging deployment via GitHub Actions
   - Deploy to `ca-staging` environment

3. **Test staging environment**:
   - URL: `https://ca-staging.ca-staging.workers.dev`
   - Verify all functionality works as expected

4. **Deploy to production**:
   ```bash
   ./scripts/deploy-workflow.sh production
   ```
   This will:
   - Merge dev branch into master
   - Push master branch to GitHub
   - Trigger automatic production deployment via GitHub Actions
   - Deploy to `ca-prod` environment

### 2. Manual Deployment (if needed)

#### Staging Deployment
```bash
./scripts/deploy-staging.sh
```

#### Production Deployment
```bash
./scripts/deploy-production.sh
```

## 🔧 Environment Configuration

### Staging Environment (`ca-staging`)
- **Worker Name**: `ca-staging`
- **Database**: `cruiser-db-staging`
- **Storage**: `cruiser-storage-staging`
- **KV Cache**: `cruiser-cache-staging`
- **URL**: `https://ca-staging.ca-staging.workers.dev`

### Production Environment (`ca-prod`)
- **Worker Name**: `ca-prod`
- **Database**: `cruiser-db-production`
- **Storage**: `cruiser-storage-production`
- **KV Cache**: `cruiser-cache-production`
- **URL**: `https://ca-prod.ca-prod.workers.dev`
- **Custom Domain**: `https://app.cruiseraviation.com` (when configured)

## 📊 Database Management

### Automatic Database Setup
The deployment scripts automatically:
1. Create D1 databases if they don't exist
2. Apply the schema from `packages/frontend/schema.sql`
3. Seed with sample data from `packages/frontend/seed.sql` (if available)

### Manual Database Operations
```bash
# List databases
npx wrangler d1 list

# Execute SQL on staging database
npx wrangler d1 execute cruiser-db-staging --file=packages/frontend/schema.sql

# Execute SQL on production database
npx wrangler d1 execute cruiser-db-production --file=packages/frontend/schema.sql
```

## 🗄️ Storage Management

### R2 Bucket Operations
```bash
# List buckets
npx wrangler r2 bucket list

# Create bucket (if needed)
npx wrangler r2 bucket create cruiser-storage-staging
npx wrangler r2 bucket create cruiser-storage-production
```

## 🔑 KV Namespace Management

### KV Operations
```bash
# List KV namespaces
npx wrangler kv:namespace list

# Create namespace (if needed)
npx wrangler kv:namespace create cruiser-cache-staging
npx wrangler kv:namespace create cruiser-cache-production
```

## 📁 File Structure

```
cruiser_app/
├── scripts/
│   ├── deploy-staging.sh      # Staging deployment script
│   ├── deploy-production.sh   # Production deployment script
│   └── deploy-workflow.sh     # Workflow helper script
├── .github/workflows/
│   ├── deploy-staging.yml     # GitHub Actions staging workflow
│   └── deploy-production.yml  # GitHub Actions production workflow
├── packages/
│   ├── frontend/
│   │   ├── schema.sql         # Database schema
│   │   └── seed.sql           # Sample data (optional)
│   └── backend/
│       └── src/worker-api.ts  # Main API worker
└── wrangler.toml              # Cloudflare Workers configuration
```

## 🔍 Monitoring and Troubleshooting

### Check Deployment Status
```bash
./scripts/deploy-workflow.sh status
```

### View GitHub Actions Logs
1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select the workflow run you want to inspect

### Common Issues

#### Database Connection Errors
- Ensure D1 databases exist and are properly configured in `wrangler.toml`
- Check that the database IDs in `wrangler.toml` match the actual database IDs

#### Storage Access Errors
- Verify R2 buckets exist and are properly configured
- Check bucket permissions and CORS settings

#### KV Namespace Errors
- Ensure KV namespaces exist and are properly configured
- Verify the namespace IDs in `wrangler.toml`

#### Deployment Failures
- Check GitHub Actions logs for detailed error messages
- Verify Cloudflare API token has appropriate permissions
- Ensure all required environment variables are set

## 🔒 Security Considerations

1. **Environment Variables**: Sensitive data should be stored as Cloudflare Workers environment variables
2. **API Tokens**: Use Cloudflare API tokens with minimal required permissions
3. **Database Access**: D1 databases are automatically secured by Cloudflare
4. **Storage Access**: R2 buckets are automatically secured by Cloudflare

## 📈 Scaling Considerations

1. **D1 Database**: Automatically scales with Cloudflare's infrastructure
2. **R2 Storage**: Automatically scales with usage
3. **Workers**: Automatically scales based on request volume
4. **KV Storage**: Automatically scales with data volume

## 🔄 Rollback Procedures

### Staging Rollback
1. Revert the dev branch to a previous commit
2. Push to trigger a new staging deployment

### Production Rollback
1. Revert the master branch to a previous commit
2. Push to trigger a new production deployment

## 📞 Support

For deployment issues:
1. Check GitHub Actions logs first
2. Verify Cloudflare dashboard for resource status
3. Review this documentation
4. Contact the development team

---

**Last Updated**: July 9, 2025
**Version**: 1.0.0 