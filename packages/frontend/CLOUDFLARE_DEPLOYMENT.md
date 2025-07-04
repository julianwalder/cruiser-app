# Cloudflare Pages Deployment Guide

## 🚀 Quick Start

### Prerequisites
1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally with `npm install -g wrangler`
3. **GitHub Repository**: Your code should be in a GitHub repository

### Automatic Deployment (Recommended)

1. **Connect GitHub to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to "Pages" → "Create a project"
   - Choose "Connect to Git"
   - Select your GitHub repository
   - Configure build settings:
     - **Framework preset**: None
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
     - **Root directory**: `packages/frontend`

2. **Environment Variables**:
   Add these in Cloudflare Pages settings:
   ```
   VITE_API_URL=https://your-api-domain.com
   VITE_APP_NAME=Cruiser Aviation
   VITE_APP_VERSION=1.0.0
   ```

3. **Deploy**:
   - Push to your main branch for production
   - Push to a feature branch for preview deployments

### Manual Deployment

1. **Build locally**:
   ```bash
   cd packages/frontend
   npm run build
   ```

2. **Deploy to staging**:
   ```bash
   npm run deploy:staging
   ```

3. **Deploy to production**:
   ```bash
   npm run deploy:production
   ```

## 🔧 Configuration Files

### `_redirects`
Handles client-side routing for React Router:
```
/*    /index.html   200
```

### `wrangler.toml`
Cloudflare Workers configuration for advanced features.

### `cloudflare-pages.json`
Custom deployment settings and headers.

## 🌍 Custom Domain Setup

1. **Add Custom Domain**:
   - In Cloudflare Pages, go to your project
   - Click "Custom domains"
   - Add your domain (e.g., `app.cruiseraviation.com`)

2. **DNS Configuration**:
   - Cloudflare will automatically configure DNS
   - Or manually add CNAME record pointing to your Pages URL

## 🔒 Security Headers

The deployment includes security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📊 Performance Optimization

### Build Optimizations
- **Code Splitting**: Automatic chunk splitting for vendor libraries
- **Tree Shaking**: Unused code elimination
- **Minification**: Terser for optimal bundle size
- **Asset Optimization**: Automatic image and font optimization

### Caching Strategy
- **Static Assets**: 1-year cache with immutable flag
- **HTML**: No cache for dynamic content
- **API Responses**: Configured via Cloudflare Workers

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: cruiser-aviation-frontend
          directory: packages/frontend/dist
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Routing Issues**:
   - Ensure `_redirects` file is in the build output
   - Verify React Router configuration

3. **Environment Variables**:
   - Check Cloudflare Pages environment variables
   - Ensure variables start with `VITE_`

4. **Performance Issues**:
   - Monitor bundle size with `npm run build -- --analyze`
   - Check for large dependencies
   - Optimize images and assets

### Debug Commands
```bash
# Check build output
npm run build && ls -la dist/

# Test locally
npm run preview

# Check bundle size
npm run build -- --analyze
```

## 📈 Monitoring

### Cloudflare Analytics
- Built-in analytics in Cloudflare Dashboard
- Real-time performance metrics
- Error tracking and reporting

### Performance Monitoring
- Core Web Vitals tracking
- Page load time monitoring
- Geographic performance analysis

## 🔄 Rollback

To rollback to a previous deployment:
1. Go to Cloudflare Pages dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Find the deployment you want to rollback to
5. Click "Redeploy"

## 📞 Support

- **Cloudflare Documentation**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Wrangler CLI**: [developers.cloudflare.com/workers/wrangler](https://developers.cloudflare.com/workers/wrangler)
- **Community**: [community.cloudflare.com](https://community.cloudflare.com) 