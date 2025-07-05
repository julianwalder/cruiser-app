import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

interface Env {
  // Production bindings
  STATIC_CONTENT?: KVNamespace;
  DB?: D1Database;
  STORAGE?: R2Bucket;
  CACHE?: KVNamespace;
  
  // Staging bindings
  STATIC_CONTENT_STAGING?: KVNamespace;
  DB_STAGING?: D1Database;
  STORAGE_STAGING?: R2Bucket;
  CACHE_STAGING?: KVNamespace;
  
  // Local bindings
  STATIC_CONTENT_LOCAL?: KVNamespace;
  DB_LOCAL?: D1Database;
  STORAGE_LOCAL?: R2Bucket;
  CACHE_LOCAL?: KVNamespace;
  
  // Environment variables
  VITE_API_URL: string;
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_MEASUREMENT_ID: string;
  VITE_ENVIRONMENT: string;
  VITE_DEBUG: string;
  VITE_CLOUDFLARE_ACCESS_AUD: string;
  VITE_CLOUDFLARE_ACCESS_TEAM_DOMAIN: string;
  JWT_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Helper function to get environment-specific bindings
    const getBindings = () => {
      const environment = env.VITE_ENVIRONMENT || 'production';
      
      switch (environment) {
        case 'staging':
          return {
            STATIC_CONTENT: env.STATIC_CONTENT_STAGING,
            DB: env.DB_STAGING,
            STORAGE: env.STORAGE_STAGING,
            CACHE: env.CACHE_STAGING,
          };
        case 'local':
          return {
            STATIC_CONTENT: env.STATIC_CONTENT_LOCAL,
            DB: env.DB_LOCAL,
            STORAGE: env.STORAGE_LOCAL,
            CACHE: env.CACHE_LOCAL,
          };
        default: // production
          return {
            STATIC_CONTENT: env.STATIC_CONTENT,
            DB: env.DB,
            STORAGE: env.STORAGE,
            CACHE: env.CACHE,
          };
      }
    };
    
    const bindings = getBindings();
    
    // Handle API requests - redirect to backend
    if (url.pathname.startsWith('/api/')) {
      const apiUrl = env.VITE_API_URL || 'https://api.cruiseraviation.com';
      const apiRequest = new Request(`${apiUrl}${url.pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      try {
        const response = await fetch(apiRequest);
        return response;
      } catch (error) {
        return new Response('API Error', { status: 500 });
      }
    }

    // Handle static assets
    const environment = env.VITE_ENVIRONMENT || 'production';
    
    if (environment === 'local') {
      // For local development, redirect to Vite dev server
      const viteUrl = 'http://localhost:3000';
      const viteRequest = new Request(`${viteUrl}${url.pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      try {
        const response = await fetch(viteRequest);
        return response;
      } catch (error) {
        return new Response('Vite dev server not running. Please start it with: npm run dev:simple', { 
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
    
    // For staging/production, serve from KV
    try {
      // Determine the asset path
      let assetPath = url.pathname;
      
      // Handle SPA routing - serve index.html for all non-asset routes
      if (!assetPath.includes('.') && !assetPath.startsWith('/api/')) {
        assetPath = '/index.html';
      }
      
      // Remove leading slash for KV lookup
      const key = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
      
      // Try to get the asset from KV
      const asset = await bindings.STATIC_CONTENT?.get(key, { type: 'arrayBuffer' });
      
      if (!asset) {
        // If asset not found, try index.html for SPA routing
        if (assetPath !== '/index.html') {
          const indexAsset = await bindings.STATIC_CONTENT?.get('index.html', { type: 'arrayBuffer' });
          if (indexAsset) {
            return new Response(indexAsset, {
              headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            });
          }
        }
        return new Response('Not Found', { status: 404 });
      }
      
      // Determine content type based on file extension
      let contentType = 'text/plain';
      if (key.endsWith('.html')) contentType = 'text/html';
      else if (key.endsWith('.css')) contentType = 'text/css';
      else if (key.endsWith('.js')) contentType = 'application/javascript';
      else if (key.endsWith('.json')) contentType = 'application/json';
      else if (key.endsWith('.png')) contentType = 'image/png';
      else if (key.endsWith('.jpg') || key.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (key.endsWith('.svg')) contentType = 'image/svg+xml';
      else if (key.endsWith('.ico')) contentType = 'image/x-icon';
      
      // Return the asset with appropriate headers
      return new Response(asset, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (e) {
      console.error('Error serving asset:', e);
      return new Response('Internal Error', { status: 500 });
    }
  },
};
