# Tonight's Deployment Plan - Cloudflare Workers Backend

## 🎯 Deployment Goals

**Priority**: Deploy a fully functional Cloudflare Workers backend tonight that supports:
- ✅ File uploads (pilot documents, aircraft documents, base/aircraft pictures)
- ✅ Cloudflare Access integration
- ✅ Data migration from existing system
- ✅ All existing functionality

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Cloudflare account with Workers, D1, R2, KV access
- [ ] Wrangler CLI installed and authenticated
- [ ] Custom domains configured in Cloudflare
- [ ] JWT secrets generated and configured

### 2. Database Preparation
- [ ] D1 databases created (staging & production)
- [ ] Database schema migrated
- [ ] Sample data loaded

### 3. Storage Setup
- [ ] R2 buckets created and configured
- [ ] CORS settings applied for file uploads
- [ ] Bucket permissions verified

## 🚀 Deployment Steps

### Step 1: Quick Setup (5 minutes)
```bash
# Install all dependencies
npm run install:all

# Build everything
npm run build
```

### Step 2: Database Migration (5 minutes)
```bash
# Run database migrations
npm run db:migrate:staging
npm run db:migrate:production
```

### Step 3: Deploy API Workers (10 minutes)
```bash
# Deploy to staging first
npm run deploy:api:staging

# Test staging deployment
curl https://staging-api.cruiseraviation.com/health

# Deploy to production
npm run deploy:api:production
```

### Step 4: Deploy Frontend (5 minutes)
```bash
# Deploy frontend to staging
npm run deploy:staging

# Deploy frontend to production
npm run deploy:production
```

### Step 5: Test Everything (10 minutes)
```bash
# Test staging
curl https://staging-api.cruiseraviation.com/health
curl -X POST https://staging-api.cruiseraviation.com/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test production
curl https://api.cruiseraviation.com/health
```

## 🔧 Alternative: Use Deployment Script

For automated deployment:
```bash
# Deploy to staging
./scripts/deploy-workers.sh staging

# Deploy to production
./scripts/deploy-workers.sh production
```

## 📁 File Upload Endpoints

The new backend supports file uploads for:

### Aircraft Documents & Images
- **Endpoint**: `POST /api/upload/aircraft`
- **Accepted**: Images (JPEG, PNG, WebP), PDFs
- **Use Case**: Aircraft registration, maintenance logs, photos

### Base Images
- **Endpoint**: `POST /api/upload/base`
- **Accepted**: Images (JPEG, PNG, WebP)
- **Use Case**: Base facility photos, hangar images

### General Documents
- **Endpoint**: `POST /api/upload/document`
- **Accepted**: PDFs, images
- **Use Case**: Pilot licenses, training certificates

## 🔐 Authentication with Cloudflare Access

### Setup Required
1. Create Access application in Cloudflare Dashboard
2. Configure authentication methods (Google, email, etc.)
3. Set up policies for admin vs user access
4. Update environment variables with Access AUD

### Integration Points
- Magic link authentication for email-based login
- JWT tokens for session management
- Role-based access control (admin/user)

## 📊 Data Migration

### What's Included
- ✅ Users table with roles
- ✅ Bases with locations and descriptions
- ✅ Aircraft with registration and type info
- ✅ Services linked to bases
- ✅ File references for documents and images

### Migration Script
```bash
# Run data migration
cd packages/backend
node src/migrations/migrate-data.js
```

## 🧪 Testing Checklist

### API Endpoints
- [ ] Health check: `GET /health`
- [ ] Magic link: `POST /api/auth/magic-link`
- [ ] User verification: `GET /api/auth/verify`
- [ ] Admin bases: `GET /api/admin/bases`
- [ ] Public bases: `GET /api/bases`
- [ ] File upload: `POST /api/upload/aircraft`

### Frontend Integration
- [ ] Login flow works
- [ ] Admin dashboard loads
- [ ] File uploads functional
- [ ] CRUD operations work
- [ ] Navigation between pages

## 🚨 Rollback Plan

If issues occur:

### Quick Rollback
```bash
# Revert to previous worker version
npx wrangler rollback --env api-staging
npx wrangler rollback --env api

# Or redeploy frontend only
npm run deploy:staging
npm run deploy:production
```

### Database Rollback
```bash
# Restore from D1 backup
npx wrangler d1 restore cruiser-db-staging --backup-id <backup-id>
```

## 📞 Support & Monitoring

### Logs
```bash
# View real-time logs
npm run worker:tail:staging
npm run worker:tail:production
```

### Performance Monitoring
- Cloudflare Analytics dashboard
- Worker performance metrics
- Error rate monitoring

## 🎉 Success Criteria

Deployment is successful when:
- [ ] All API endpoints respond correctly
- [ ] File uploads work for all file types
- [ ] Authentication flows properly
- [ ] Frontend loads without errors
- [ ] Database queries return expected data
- [ ] No 530 errors in staging/production

## ⚡ Quick Commands Reference

```bash
# Full deployment to staging
./scripts/deploy-workers.sh staging

# Full deployment to production
./scripts/deploy-workers.sh production

# Manual API deployment
npm run deploy:api:staging
npm run deploy:api:production

# Database migration
npm run db:migrate:staging
npm run db:migrate:production

# View logs
npm run worker:tail:staging
npm run worker:tail:production

# Test endpoints
curl https://staging-api.cruiseraviation.com/health
curl https://api.cruiseraviation.com/health
```

## 🕐 Timeline Estimate

- **Setup & Build**: 10 minutes
- **Database Migration**: 5 minutes
- **API Deployment**: 10 minutes
- **Frontend Deployment**: 5 minutes
- **Testing**: 10 minutes
- **Total**: ~40 minutes

**Ready to deploy tonight! 🚀** 