import { createCloudflareAuthService, UserRole } from './services/cloudflare-auth';

interface Env {
  // Workers Sites binding
  __STATIC_CONTENT: any;
  
  // Production bindings
  DB?: D1Database;
  STORAGE?: R2Bucket;
  CACHE?: KVNamespace;
  
  // Staging bindings
  DB_STAGING?: D1Database;
  STORAGE_STAGING?: R2Bucket;
  CACHE_STAGING?: KVNamespace;
  
  // Local bindings
  DB_LOCAL?: D1Database;
  STORAGE_LOCAL?: R2Bucket;
  CACHE_LOCAL?: KVNamespace;
  
  // Environment variables
  VITE_API_URL: string;
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_ENVIRONMENT: string;
  VITE_DEBUG: string;
  VITE_CLOUDFLARE_ACCESS_AUD: string;
  VITE_CLOUDFLARE_ACCESS_TEAM_DOMAIN: string;
  JWT_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const environment = env.VITE_ENVIRONMENT || 'production';
    
    console.log(`[${new Date().toISOString()}] ${request.method} ${url.pathname}`);
    console.log('Environment:', environment);

    // Initialize Cloudflare Access authentication service
    const authService = createCloudflareAuthService(env);

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
      console.log('API request detected:', url.pathname);
      
      // Apply role-based authentication based on the API endpoint
      const authResult = await this.handleApiAuthentication(request, url.pathname, authService);
      if (authResult) {
        return authResult;
      }
      
      // Determine the correct API URL based on environment
      let apiUrl: string;
      switch (environment) {
        case 'staging':
          apiUrl = 'https://cruiser-aviation-api-staging.julian-pad.workers.dev';
          break;
        case 'local':
          apiUrl = 'http://localhost:8787';
          break;
        default: // production
          apiUrl = 'https://cruiser-aviation-api.julian-pad.workers.dev';
          break;
      }
      
      console.log('Redirecting to API:', `${apiUrl}${url.pathname}`);
      
      // Create new request with the correct API URL
      const apiRequest = new Request(`${apiUrl}${url.pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      try {
        const response = await fetch(apiRequest);
        console.log('API response status:', response.status);
        return response;
      } catch (error) {
        console.error('API request failed:', error);
        return new Response('API request failed', { status: 500 });
      }
    }

    // For all other requests, let Workers Sites handle static assets
    // Workers Sites will automatically serve files from the dist directory
    // If a file doesn't exist, Workers Sites will return a 404, and we can handle SPA routing
    
    // Check if this is a request for a static asset (has file extension)
    const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(url.pathname);
    
    if (hasFileExtension) {
      // Let Workers Sites handle static assets automatically
      console.log('Static asset request, letting Workers Sites handle it');
      // Workers Sites will automatically serve the file if it exists
      // If it doesn't exist, it will return a 404
      return fetch(request);
    } else {
      // This is likely a SPA route (no file extension)
      console.log('SPA route detected, serving index.html');
      
      // Create a request for index.html
      const indexUrl = new URL(request.url);
      indexUrl.pathname = '/index.html';
      
      try {
        const indexResponse = await fetch(indexUrl.toString());
        if (indexResponse.ok) {
          // Return index.html with the original URL's content type
          return new Response(indexResponse.body, {
            status: 200,
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache',
            },
          });
        }
      } catch (error) {
        console.error('Failed to serve index.html for SPA routing:', error);
      }
      
      // If we can't serve index.html, return 404
      return new Response('Not Found', { status: 404 });
    }
  },

  /**
   * Handle API authentication based on endpoint
   */
  async handleApiAuthentication(request: Request, pathname: string, authService: any): Promise<Response | null> {
    // Public endpoints that don't require authentication
    const publicEndpoints = [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/public'
    ];

    if (publicEndpoints.some(endpoint => pathname.startsWith(endpoint))) {
      return null; // Allow access
    }

    // Admin endpoints require admin or superadmin role
    if (pathname.startsWith('/api/admin/')) {
      const authMiddleware = authService.createAuthMiddleware(UserRole.ADMIN);
      return await authMiddleware(request);
    }

    // Instructor endpoints require instructor role or higher
    if (pathname.startsWith('/api/instructor/')) {
      const authMiddleware = authService.createAuthMiddleware(UserRole.INSTRUCTOR);
      return await authMiddleware(request);
    }

    // Base manager endpoints require basemanager role or higher
    if (pathname.startsWith('/api/basemanager/')) {
      const authMiddleware = authService.createAuthMiddleware(UserRole.BASEMANAGER);
      return await authMiddleware(request);
    }

    // All other API endpoints require at least user authentication
    const authMiddleware = authService.createAuthMiddleware(UserRole.USER);
    return await authMiddleware(request);
  }
}; 