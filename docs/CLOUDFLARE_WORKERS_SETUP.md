# Cloudflare Workers Setup for Staging and Production

This document outlines the setup for deploying the Cruiser Aviation Platform to Cloudflare Workers with separate staging and production environments.

## Environment Overview

### Staging Environment
- **Branch**: `dev`
- **Worker Name**: `cruiser-aviation-frontend-staging`
- **Database**: `cruiser-db-staging`
- **Storage**: `cruiser-storage-staging`
- **KV Namespace**: `b9b4a8aa1da64f3696c4778e03642cb8`
- **URL**: `https://cruiser-aviation-frontend-staging.your-subdomain.workers.dev`

### Production Environment
- **Branch**: `master`
- **Worker Name**: `cruiser-aviation-frontend`
- **Database**: `cruiser-db-prod`
- **Storage**: `cruiser-storage-prod`
- **KV Namespace**: `f10d38b010894c3a8e75c77d2b0ae6a9`
- **URL**: `https://cruiser-aviation-frontend.your-subdomain.workers.dev`

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with Workers enabled
2. **Wrangler CLI**: Install Wrangler CLI for deployment
3. **API Token**: Create a Cloudflare API token with Workers permissions
4. **D1 Databases**: Create D1 databases for staging and production
5. **R2 Buckets**: Create R2 buckets for file storage
6. **KV Namespaces**: Create KV namespaces for caching and static content

## Setup Steps

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Create D1 Databases

```bash
# Create staging database
wrangler d1 create cruiser-db-staging

# Create production database
wrangler d1 create cruiser-db-prod
```

### 4. Create R2 Buckets

```bash
# Create staging bucket
wrangler r2 bucket create cruiser-storage-staging

# Create production bucket
wrangler r2 bucket create cruiser-storage-prod
```

### 5. Create KV Namespaces

```bash
# Create staging KV namespace
wrangler kv:namespace create "CACHE" --env staging
wrangler kv:namespace create "__STATIC_CONTENT" --env staging

# Create production KV namespace
wrangler kv:namespace create "CACHE" --env production
wrangler kv:namespace create "__STATIC_CONTENT" --env production
```

### 6. Set Environment Variables

Update the `wrangler.toml` file with the correct database IDs and KV namespace IDs from the previous steps.

### 7. Set Secrets

```bash
# Set JWT secret for staging
wrangler secret put JWT_SECRET --env staging

# Set JWT secret for production
wrangler secret put JWT_SECRET --env production
```

## Deployment

### Manual Deployment

#### Deploy to Staging
```bash
# Make sure you're on the dev branch
git checkout dev

# Deploy to staging
cd packages/frontend
npm run deploy:staging
```

#### Deploy to Production
```bash
# Make sure you're on the master branch
git checkout master

# Deploy to production
cd packages/frontend
npm run deploy:production
```

### Automated Deployment (GitHub Actions)

The repository includes GitHub Actions workflows that automatically deploy:

- **Staging**: Deploys automatically when code is pushed to the `dev` branch
- **Production**: Deploys automatically when code is pushed to the `master` branch

#### Required GitHub Secrets

Set these secrets in your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## Mock Data

The worker includes comprehensive mock data that will be used when the database is not available or when queries fail. This ensures the application always has data to display.

### Included Mock Data

- **Services**: Flight Training, Aircraft Rental, Maintenance
- **Bases**: Main Airport, Regional Field
- **Aircraft**: Cessna 172, Piper Arrow
- **Users**: Admin User, Pilot User, Student Pilot

All mock data includes realistic images (base64 encoded) and complete user profiles with aviation-specific information.

## Environment Configuration

### Staging Environment Variables
- `VITE_API_URL`: `https://staging-api.cruiseraviation.com`
- `VITE_APP_NAME`: `Cruiser Aviation (Staging)`
- `VITE_ENVIRONMENT`: `staging`
- `VITE_DEBUG`: `true`

### Production Environment Variables
- `VITE_API_URL`: `https://api.cruiseraviation.com`
- `VITE_APP_NAME`: `Cruiser Aviation`
- `VITE_ENVIRONMENT`: `production`
- `VITE_DEBUG`: `false`

## Database Schema

The worker expects the following database tables:

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Services Table
```sql
CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  base_price DECIMAL(10,2),
  duration TEXT,
  default_payment_plan TEXT,
  is_active BOOLEAN DEFAULT 1,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Bases Table
```sql
CREATE TABLE bases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT,
  code TEXT,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Aircraft Table
```sql
CREATE TABLE aircraft (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT,
  registration TEXT,
  call_sign TEXT,
  model TEXT,
  year INTEGER,
  total_time INTEGER,
  is_active BOOLEAN DEFAULT 1,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Ensure all dependencies are installed and TypeScript compilation passes
2. **Deployment Failures**: Check that you're on the correct branch and have the necessary permissions
3. **Database Connection Issues**: Verify database IDs and permissions in `wrangler.toml`
4. **Missing Secrets**: Ensure JWT_SECRET is set for both environments

### Debug Commands

```bash
# Test local worker
npm run worker:dev

# Check wrangler configuration
wrangler whoami

# List environments
wrangler env list

# View logs
wrangler tail --env staging
wrangler tail --env production
```

## Security Considerations

1. **JWT Secrets**: Use strong, unique secrets for each environment
2. **API Tokens**: Store Cloudflare API tokens securely
3. **Environment Variables**: Never commit sensitive data to version control
4. **Access Control**: Use Cloudflare Access for additional security layers

## Monitoring and Logs

- **Staging Logs**: `wrangler tail --env staging`
- **Production Logs**: `wrangler tail --env production`
- **Analytics**: Available through Cloudflare Analytics dashboard
- **Performance**: Monitor through Cloudflare Workers Analytics

## Support

For issues with the deployment setup:

1. Check the Cloudflare Workers documentation
2. Review the wrangler.toml configuration
3. Verify all required resources are created
4. Check GitHub Actions logs for automated deployments 