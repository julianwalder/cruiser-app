# Cloudflare Access Setup for Cruiser Aviation Platform

This document explains how to set up Cloudflare Access for authentication in the Cruiser Aviation Platform.

## Overview

Cloudflare Access provides secure authentication and authorization for your application. It integrates with various identity providers (Google, GitHub, SAML, etc.) and provides JWT tokens that can be verified by your Cloudflare Worker.

## Prerequisites

1. A Cloudflare account with Access enabled
2. A domain configured in Cloudflare
3. Your application deployed to Cloudflare Workers

## Step 1: Configure Cloudflare Access

### 1.1 Create an Access Application

1. Go to your Cloudflare dashboard
2. Navigate to **Access** > **Applications**
3. Click **Add an application**
4. Choose **Self-hosted**
5. Configure the application:
   - **Application name**: `Cruiser Aviation Platform`
   - **Session Duration**: `24 hours` (or your preference)
   - **Application domain**: Your domain (e.g., `cruiseraviation.com`)

### 1.2 Configure Identity Providers

1. In your Access application, go to **Authentication**
2. Add your preferred identity providers:
   - **Google**: For Google Workspace users
   - **GitHub**: For developers
   - **SAML**: For enterprise SSO
   - **One-time PIN**: For temporary access

### 1.3 Configure Access Policies

1. Go to **Policies** in your Access application
2. Create policies based on your needs:

#### Admin Access Policy
- **Policy name**: `Admin Access`
- **Action**: `Allow`
- **Rules**:
  - `User email` `ends with` `@yourcompany.com`
  - OR `User email` `equals` `admin@cruiseraviation.com`

#### User Access Policy
- **Policy name**: `User Access`
- **Action**: `Allow`
- **Rules**:
  - `User email` `ends with` `@yourcompany.com`

## Step 2: Get JWT Secret

1. In your Access application, go to **Settings**
2. Copy the **Audience** value (e.g., `https://cruiseraviation.com`)
3. Go to **Service Auth** > **Service Token**
4. Generate a new service token
5. Copy the **Client ID** and **Client Secret**

## Step 3: Update Environment Variables

### 3.1 Update wrangler.toml

Update your `wrangler.toml` file with the correct values:

```toml
[env.production.vars]
VITE_CLOUDFLARE_ACCESS_AUD = "https://cruiseraviation.com"
VITE_CLOUDFLARE_ACCESS_TEAM_DOMAIN = "cruiseraviation.com"

[env.production.secrets]
JWT_SECRET = "your-actual-jwt-secret-from-cloudflare"
```

### 3.2 Set Secrets

Set the JWT secret using Wrangler:

```bash
# For production
npx wrangler secret put JWT_SECRET --env production

# For staging
npx wrangler secret put JWT_SECRET --env staging
```

## Step 4: Configure DNS and Routing

### 4.1 DNS Configuration

1. In Cloudflare DNS, ensure your domain points to your Worker
2. Add a CNAME record if needed:
   - **Name**: `app` (or your preferred subdomain)
   - **Target**: `cruiser-aviation-frontend.your-subdomain.workers.dev`

### 4.2 Access Configuration

1. In your Access application, go to **Configuration**
2. Set the **Application domain** to your domain
3. Configure **Custom domains** if needed

## Step 5: Test Authentication

### 5.1 Test Access Flow

1. Visit your application URL
2. You should be redirected to Cloudflare Access login
3. Authenticate with your configured identity provider
4. You should be redirected back to your application with a JWT token

### 5.2 Test API Endpoints

Test the authentication endpoints:

```bash
# Test health endpoint (no auth required)
curl https://your-domain.com/api/health

# Test auth profile (requires valid token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-domain.com/api/auth/profile

# Test admin dashboard (requires auth)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://your-domain.com/api/admin/dashboard
```

## Step 6: Frontend Integration

The frontend is already configured to work with Cloudflare Access:

### 6.1 Authentication Hook

Use the `useCloudflareAuth` hook in your React components:

```tsx
import { useCloudflareAuth } from '../hooks/useCloudflareAuth';

function App() {
  const { user, authenticated, loading, logout } = useCloudflareAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 6.2 Protected Routes

Create protected route components:

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useCloudflareAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <div>Access denied</div>;
  }

  return <>{children}</>;
}
```

## Troubleshooting

### Common Issues

1. **JWT verification fails**:
   - Check that the JWT secret is correctly set
   - Verify the audience and issuer match your configuration
   - Ensure the token hasn't expired

2. **Access denied errors**:
   - Check your Access policies
   - Verify the user's email matches policy rules
   - Check the application domain configuration

3. **CORS errors**:
   - Ensure CORS headers are properly set in your Worker
   - Check that the origin is allowed

### Debug Mode

Enable debug mode by setting `VITE_DEBUG = "true"` in your environment variables. This will provide more detailed error messages.

## Security Considerations

1. **JWT Secret**: Keep your JWT secret secure and rotate it regularly
2. **Token Storage**: Store tokens securely in localStorage (consider httpOnly cookies for production)
3. **HTTPS**: Always use HTTPS in production
4. **Token Expiration**: Set appropriate token expiration times
5. **Policy Review**: Regularly review and update Access policies

## Next Steps

1. Configure additional identity providers as needed
2. Set up custom claims for user roles and permissions
3. Implement role-based access control in your application
4. Set up monitoring and logging for authentication events
5. Configure backup authentication methods

## Support

For Cloudflare Access support:
- [Cloudflare Access Documentation](https://developers.cloudflare.com/access/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Support](https://support.cloudflare.com/) 