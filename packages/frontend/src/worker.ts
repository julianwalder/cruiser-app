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
    
    // Log request details
    console.log(`[${new Date().toISOString()}] ${request.method} ${url.pathname}${url.search}`);
    console.log(`Environment: ${environment}`);
    console.log(`User-Agent: ${request.headers.get('User-Agent') || 'Unknown'}`);
    
    // Helper function to get environment-specific bindings
    const getBindings = () => {
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
    
    // Log binding information
    console.log(`Static content binding available: ${!!bindings.STATIC_CONTENT}`);
    console.log(`DB binding available: ${!!bindings.DB}`);
    console.log(`Storage binding available: ${!!bindings.STORAGE}`);
    console.log(`Cache binding available: ${!!bindings.CACHE}`);
    
    // Handle API requests - redirect to backend
    if (url.pathname.startsWith('/api/')) {
      console.log(`API request detected: ${url.pathname}`);
      
      // Use environment-specific API URL
      let apiUrl;
      switch (environment) {
        case 'staging':
          apiUrl = 'https://cruiser-aviation-api-staging.julian-pad.workers.dev';
          break;
        case 'local':
          apiUrl = 'http://localhost:8787';
          break;
        default: // production
          apiUrl = env.VITE_API_URL || 'https://api.cruiseraviation.com';
      }
      
      console.log(`Redirecting to API: ${apiUrl}${url.pathname}${url.search}`);
      
      const apiRequest = new Request(`${apiUrl}${url.pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      try {
        const response = await fetch(apiRequest);
        console.log(`API response status: ${response.status}`);
        return response;
      } catch (error) {
        console.error('API Error:', error);
        return new Response('API Error', { status: 500 });
      }
    }

    if (environment === 'local') {
      console.log('Local environment detected, redirecting to Vite dev server');
      // For local development, redirect to Vite dev server
      const viteUrl = 'http://localhost:3000';
      const viteRequest = new Request(`${viteUrl}${url.pathname}${url.search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      try {
        const response = await fetch(viteRequest);
        console.log(`Vite response status: ${response.status}`);
        return response;
      } catch (error) {
        console.error('Vite dev server error:', error);
        return new Response('Vite dev server not running. Please start it with: npm run dev:simple', { 
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
    
    // For staging/production, serve from site assets using getAssetFromKV
    console.log(`Attempting to serve static asset: ${url.pathname}`);
    
    // Log what we're looking for
    const assetKey = url.pathname === '/' ? 'index.html' : url.pathname.substring(1);
    console.log(`Looking for asset with key: ${assetKey}`);
    
    try {
      // Use getAssetFromKV to handle asset serving with proper fallbacks
      const response = await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: bindings.STATIC_CONTENT,
          ASSET_MANIFEST: {},
          cacheControl: {
            browserTTL: 60 * 60 * 24 * 365, // 1 year
            edgeTTL: 60 * 60 * 24 * 365, // 1 year
            bypassCache: false,
          },
        }
      );

      console.log(`Asset served successfully: ${url.pathname} (${response.status})`);
      return response;
    } catch (e) {
      // If getAssetFromKV fails, try to provide more detailed error information
      console.error('Error serving asset:', e);
      
      // Check if it's a KV namespace binding issue
      if (e instanceof Error) {
        if (e.message.includes('KV namespace') || e.message.includes('bound to the script')) {
          console.error('KV namespace binding issue detected');
          return new Response(`KV namespace binding error: ${e.message}`, { 
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        
        if (e.message.includes('could not find') || e.message.includes('in your content namespace')) {
          console.error('Asset not found in KV namespace');
          console.log(`Attempted to find: ${assetKey}`);
          
          // Try to list available keys in the namespace (for debugging)
          if (bindings.STATIC_CONTENT) {
            try {
              const keys = await bindings.STATIC_CONTENT.list();
              console.log(`Available keys in namespace (first 10):`, keys.keys.slice(0, 10).map(k => k.name));
              
              // Try to find a matching hashed file
              const matchingKey = this.findHashedAsset(url.pathname, keys.keys.map(k => k.name));
              
              if (matchingKey) {
                console.log(`Found hashed asset: ${matchingKey} for ${url.pathname}`);
                const hashedResponse = await getAssetFromKV(
                  {
                    request: new Request(`https://example.com/${matchingKey}`),
              waitUntil: ctx.waitUntil.bind(ctx),
            },
            {
                    ASSET_NAMESPACE: bindings.STATIC_CONTENT,
                    ASSET_MANIFEST: {},
                    cacheControl: {
                      browserTTL: 60 * 60 * 24 * 365, // 1 year
                      edgeTTL: 60 * 60 * 24 * 365, // 1 year
                      bypassCache: false,
                    },
                  }
                );
                
                console.log(`Hashed asset served successfully: ${matchingKey} (${hashedResponse.status})`);
                return hashedResponse;
              }
            } catch (listError) {
              console.error('Could not list keys:', listError);
            }
          }
          
          return new Response(`Asset not found: ${assetKey}`, { 
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      }
      
      return new Response(`Asset serving error: ${e instanceof Error ? e.message : 'Unknown error'}`, { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },

  async serveStaticAsset(path: string, env: Env): Promise<Response | null> {
    // Get environment-specific bindings
    const environment = env.VITE_ENVIRONMENT || 'production';
    const getBindings = () => {
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
    
    const { STATIC_CONTENT: staticContent } = getBindings();
    
    if (!staticContent) {
      console.error('Static content binding not available');
      return null;
    }

    try {
      // Try the exact path first
      let asset = await getAssetFromKV(
        {
          request: new Request(`https://example.com${path}`),
          waitUntil: () => Promise.resolve(),
        },
        {
          ASSET_NAMESPACE: staticContent,
          ASSET_MANIFEST: {},
        }
      );

      console.log(`Asset served successfully: ${path} (${asset.status})`);
      return asset;
    } catch (error: any) {
      console.error(`Error serving asset: ${error}`);
      
      // If the exact path fails, try to find a hashed version
      if (error.message && (error.message.includes('could not find') || error.message.includes('not found'))) {
        try {
          // Get all keys to find hashed versions
          const keys = await staticContent.list();
          console.log(`Available keys in namespace (first 10):`, keys.keys.slice(0, 10).map((k: any) => k.name));
          
          // Try to find a matching hashed file
          const matchingKey = this.findHashedAsset(path, keys.keys.map((k: any) => k.name));
          
          if (matchingKey) {
            console.log(`Found hashed asset: ${matchingKey} for ${path}`);
            const asset = await getAssetFromKV(
              {
                request: new Request(`https://example.com/${matchingKey}`),
                waitUntil: () => Promise.resolve(),
              },
              {
                ASSET_NAMESPACE: staticContent,
              ASSET_MANIFEST: {},
            }
          );
            
            console.log(`Hashed asset served successfully: ${matchingKey} (${asset.status})`);
            return asset;
          }
        } catch (fallbackError) {
          console.error(`Fallback asset lookup failed: ${fallbackError}`);
        }
      }
      
      console.error(`Asset not found in KV namespace`);
      console.error(`Attempted to find: ${path}`);
      return null;
    }
  },

  findHashedAsset(originalPath: string, availableKeys: string[]): string | null {
    // Remove leading slash for comparison
    const cleanPath = originalPath.startsWith('/') ? originalPath.slice(1) : originalPath;
    
    // For index.html, look for index.*.html
    if (cleanPath === 'index.html') {
      const indexFile = availableKeys.find(key => 
        key.startsWith('index.') && key.endsWith('.html')
      );
      return indexFile || null;
    }
    
    // For assets, look for files that start with the same name but have hash suffixes
    if (cleanPath.startsWith('assets/')) {
      const fileName = cleanPath.split('/').pop()?.split('.')[0]; // Get base name without extension
      const extension = cleanPath.split('.').pop(); // Get extension
      
      if (fileName && extension) {
        const matchingAsset = availableKeys.find(key => 
          key.startsWith(`assets/${fileName}.`) && key.endsWith(`.${extension}`)
        );
        return matchingAsset || null;
      }
    }
    
    return null;
  },
};
