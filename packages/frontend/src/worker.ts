import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';
import { SimpleAPI } from './api/simple-api';

interface Env {
  STATIC_CONTENT: KVNamespace;
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
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
    
    // Handle API requests with simple API
    if (url.pathname.startsWith('/api/')) {
      const api = new SimpleAPI(env);
      const response = await api.handleRequest(request, url);
      
      if (response) {
        return response;
      }
      
      // Fallback to backend if not handled by edge API
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
    try {
      // Check if we're in development mode (no STATIC_CONTENT binding or empty namespace)
      const isDevelopment = !env.STATIC_CONTENT || env.VITE_ENVIRONMENT === 'development';
      
      if (isDevelopment) {
        // In development, serve a simple response indicating the app is running
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Cruiser Aviation - Development</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
                .container { max-width: 600px; margin: 0 auto; }
                .status { color: #22c55e; font-weight: bold; }
                .info { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🚁 Cruiser Aviation Platform</h1>
                <p class="status">✅ Worker is running in development mode</p>
                <div class="info">
                  <h3>Development Setup:</h3>
                  <p><strong>Frontend:</strong> <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></p>
                  <p><strong>API Server:</strong> <a href="http://localhost:8787" target="_blank">http://localhost:8787</a></p>
                  <p><strong>Environment:</strong> ${env.VITE_ENVIRONMENT || 'development'}</p>
                </div>
                <p>For full development experience, run both the frontend and API servers.</p>
              </div>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
      }

      const asset = await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.STATIC_CONTENT,
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
              ASSET_NAMESPACE: env.STATIC_CONTENT,
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
