import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

interface Env {
  __STATIC_CONTENT: KVNamespace;
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
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle API requests (proxy to backend)
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
    try {
      const asset = await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
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
              ASSET_NAMESPACE: env.__STATIC_CONTENT,
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
