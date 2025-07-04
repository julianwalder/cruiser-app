# 🔧 GitHub Setup Guide

## Required GitHub Secrets

To enable automated deployments, you need to add these secrets to your GitHub repository:

### 1. **CLOUDFLARE_API_TOKEN**
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
- Click **Create Token**
- Use **Custom token** template
- Add these permissions:
  - **Account** → **Cloudflare Workers** → **Edit**
  - **Zone** → **Zone** → **Read** (if using custom domains)
- Copy the token and add it to GitHub

### 2. **CLOUDFLARE_ACCOUNT_ID**
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
- Look at the URL: `https://dash.cloudflare.com/{ACCOUNT_ID}`
- Copy the Account ID from the URL
- Add it to GitHub

## How to Add Secrets

1. Go to your GitHub repository: `https://github.com/{username}/{repo-name}`
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the exact names above

## Environment Variables Setup

### Option 1: Automated Script (Recommended)

We provide a script to automatically set up environment variables in Cloudflare:

```bash
# Set up all environment variables for both production and staging
npm run setup:cloudflare-vars

# List current variables
npm run setup:cloudflare-vars -- --list

# List variables for specific environment
npm run setup:cloudflare-vars -- --list --env production
npm run setup:cloudflare-vars -- --list --env staging

# Delete all variables (with confirmation)
npm run setup:cloudflare-vars -- --delete --env staging
```

### Option 2: Using .env Files

1. Copy the example files:
   ```bash
   cp env.production.example .env.production
   cp env.staging.example .env.staging
   ```

2. Edit the files with your actual values:
   ```bash
   # Edit production variables
   nano .env.production
   
   # Edit staging variables  
   nano .env.staging
   ```

3. Run the setup script (it will automatically load from .env files):
   ```bash
   npm run setup:cloudflare-vars
   ```

### Option 3: Manual Cloudflare Dashboard

1. Go to [Cloudflare Workers](https://dash.cloudflare.com/)
2. Select your Worker (e.g., `cruiser-aviation-frontend`)
3. Go to **Settings** → **Variables**
4. Add your environment variables manually

## Deployment Workflow

Once secrets are set up, deployments will happen automatically:

- **Push to `dev` branch** → Deploy to staging
- **Push to `master` branch** → Deploy to production
- **Pull Request** → Create preview deployment

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Ensure your Cloudflare API token has the correct permissions
   - Check that the Account ID is correct

2. **Environment variables not working**
   - Verify variables are set in Cloudflare Dashboard
   - Check that variable names start with `VITE_`
   - Ensure the Worker is deployed with the latest variables

3. **Deployment fails**
   - Check GitHub Actions logs for specific errors
   - Verify all required secrets are set
   - Ensure the Worker name matches in `wrangler.toml`

### Getting Help

- Check the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
- Review GitHub Actions logs for detailed error messages
- Ensure your Cloudflare account has Workers enabled

## Benefits of Cloudflare Dashboard Variables

✅ **More secure** - Variables not stored in code  
✅ **Easier management** - Change without redeploying  
✅ **Environment-specific** - Different values per environment  
✅ **No code changes** - Update variables without touching code  
✅ **Version control** - Variables not tracked in Git  

---

**Next Steps:** Once secrets and environment variables are configured, every push to `dev` or `master` will automatically deploy to Cloudflare Workers! 