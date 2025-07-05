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
      const asset = await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: bindings.STATIC_CONTENT,
          ASSET_MANIFEST: {},
          mapRequestToAsset: (req: Request) => {
            // Handle SPA routing - serve index.html for all non-asset routes
            const url = new URL(req.url);
            if (!url.pathname.includes('.') && !url.pathname.startsWith('/api/')) {
              return new Request(`${url.origin}/index.html`, req);
            }
            return req;
          },
        }
      );

      // Add cache headers for static assets
      const response = new Response(asset.body, asset);
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return response;
    } catch (e) {
      // If asset not found, serve index.html for SPA routing
      if (e instanceof Error && e.message.includes('not found')) {
        try {
          const indexAsset = await getAssetFromKV(
            {
              request: new Request(`${url.origin}/index.html`),
              waitUntil: ctx.waitUntil.bind(ctx),
            },
            {
              ASSET_NAMESPACE: bindings.STATIC_CONTENT,
              ASSET_MANIFEST: {},
            }
          );
          return new Response(indexAsset.body, indexAsset);
        } catch (indexError) {
          return new Response('Not Found', { status: 404 });
        }
      }
      return new Response('Internal Error', { status: 500 });
    }
  },
};
