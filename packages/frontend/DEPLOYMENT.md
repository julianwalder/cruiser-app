# 🚀 Deployment Guide - Cursor → GitHub → Cloudflare Workers

This document explains the automated deployment flow for the Cruiser Aviation frontend.

## 📋 Overview

**Flow:** Cursor (Local Development) → GitHub (Version Control) → Cloudflare Workers (Deployment)

### **Branch Strategy:**
- **`dev` branch** → **Staging Environment** (automatic deployment)
- **`master` branch** → **Production Environment** (automatic deployment)
- **Pull Requests** → **Preview Environment** (automatic deployment)

## 🔄 Deployment Flow

### 1. **Local Development (Cursor)**
```bash
# Make changes in Cursor
# Test locally
npm run dev

# Commit and push to GitHub
git add .
git commit -m "feat: add new feature"
git push origin dev  # or master
```

### 2. **GitHub Actions (Automatic)**
- **Push to `dev`** → Deploys to staging
- **Push to `master`** → Deploys to production  
- **Pull Request** → Creates preview deployment

### 3. **Cloudflare Workers (Live)**
- **Staging:** https://cruiser-aviation-frontend-staging.julian-pad.workers.dev
- **Production:** https://cruiser-aviation-frontend.julian-pad.workers.dev
- **Preview:** https://cruiser-aviation-frontend-preview-pr-{PR_NUMBER}.julian-pad.workers.dev

## 🛠️ Setup Requirements

### **GitHub Secrets Required:**
1. **`CLOUDFLARE_API_TOKEN`** - Your Cloudflare API token
2. **`CLOUDFLARE_ACCOUNT_ID`** - Your Cloudflare account ID

### **How to Add Secrets:**
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the two secrets above

## 📁 Workflow Files

### **`.github/workflows/deploy.yml`**
- Handles automatic deployments on push to `dev` and `master`
- Deploys to staging/production based on branch
- Comments on PRs with deployment URLs

### **`.github/workflows/preview.yml`**
- Creates preview deployments for pull requests
- Generates unique URLs for each PR
- Comments on PRs with preview URLs

## 🔧 Environment Variables

### **Production Environment:**
```toml
VITE_API_URL = "https://api.cruiseraviation.com"
VITE_APP_NAME = "Cruiser Aviation"
VITE_APP_VERSION = "1.0.0"
# Firebase config...
```

### **Staging Environment:**
```toml
VITE_API_URL = "https://staging-api.cruiseraviation.com"
VITE_APP_NAME = "Cruiser Aviation (Staging)"
VITE_APP_VERSION = "1.0.0"
# Firebase config...
```

## 🚦 Deployment Triggers

| Action | Branch | Environment | URL |
|--------|--------|-------------|-----|
| Push to `dev` | `dev` | Staging | `cruiser-aviation-frontend-staging.julian-pad.workers.dev` |
| Push to `master` | `master` | Production | `cruiser-aviation-frontend.julian-pad.workers.dev` |
| Pull Request | Any | Preview | `cruiser-aviation-frontend-preview-pr-{PR_NUMBER}.julian-pad.workers.dev` |

## 🔍 Monitoring Deployments

### **GitHub Actions:**
- Check the **Actions** tab in your GitHub repository
- View real-time deployment logs
- See deployment status and any errors

### **Cloudflare Dashboard:**
- Monitor Worker performance
- View analytics and logs
- Check environment variables

## 🚨 Troubleshooting

### **Common Issues:**

1. **Build Failures:**
   - Check TypeScript errors
   - Verify all dependencies are installed
   - Review GitHub Actions logs

2. **Deployment Failures:**
   - Verify GitHub secrets are set correctly
   - Check Cloudflare API token permissions
   - Ensure Wrangler is properly configured

3. **Environment Variable Issues:**
   - Verify `wrangler.toml` configuration
   - Check that all required variables are set
   - Ensure Firebase config is correct

### **Manual Deployment (Fallback):**
```bash
# If GitHub Actions fails, you can deploy manually:
cd packages/frontend

# Staging
npm run deploy:staging

# Production  
npm run deploy:production
```

## 📈 Benefits of This Setup

✅ **Automated Deployments** - No manual intervention needed  
✅ **Environment Separation** - Clear staging/production distinction  
✅ **Preview Deployments** - Test changes before merging  
✅ **Rollback Capability** - Easy to revert deployments  
✅ **Monitoring** - Full visibility into deployment status  
✅ **Security** - Secrets managed securely in GitHub  

## 🔄 Development Workflow

### **Typical Development Cycle:**

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Develop & Test:**
   ```bash
   npm run dev  # Local development
   ```

3. **Create Pull Request:**
   - Push to feature branch
   - Create PR to `dev` branch
   - Preview deployment automatically created

4. **Review & Merge:**
   - Review changes on preview URL
   - Merge to `dev` → Automatic staging deployment
   - Test on staging environment

5. **Deploy to Production:**
   - Merge `dev` to `master`
   - Automatic production deployment

## 📞 Support

If you encounter issues with the deployment process:

1. Check GitHub Actions logs first
2. Verify Cloudflare configuration
3. Review this documentation
4. Check environment variables in `wrangler.toml`

---

**Last Updated:** January 2025  
**Version:** 1.0.0 