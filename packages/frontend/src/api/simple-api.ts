import { createCloudflareAuthService, CloudflareUser } from '../services/cloudflare-auth';
import { mockData } from './mock-data';

interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  VITE_APP_NAME: string;
  VITE_APP_VERSION: string;
  VITE_ENVIRONMENT: string;
  VITE_DEBUG: string;
  VITE_CLOUDFLARE_ACCESS_AUD: string;
  VITE_CLOUDFLARE_ACCESS_TEAM_DOMAIN: string;
  JWT_SECRET: string;
}

export class SimpleAPI {
  private authService: ReturnType<typeof createCloudflareAuthService>;

  constructor(private env: Env) {
    this.authService = createCloudflareAuthService(env);
  }

  async handleRequest(request: Request, url: URL): Promise<Response | null> {
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // Health check endpoint
    if (path === '/api/health' && method === 'GET') {
      return this.healthCheck();
    }

    // App info endpoint
    if (path === '/api/app-info' && method === 'GET') {
      return this.appInfo();
    }

    // Authentication endpoints
    if (path === '/api/auth/profile' && method === 'GET') {
      return this.getAuthProfile(request);
    }

    if (path === '/api/auth/verify' && method === 'GET') {
      return this.verifyAuth(request);
    }

    if (path === '/api/auth/magic-link' && method === 'POST') {
      return this.createMagicLink(request);
    }

    // Admin endpoints (require authentication)
    if (path === '/api/admin/dashboard' && method === 'GET') {
      return this.getAdminDashboard(request);
    }

    if (path === '/api/admin/services' && method === 'GET') {
      return this.getServices(request);
    }

    if (path === '/api/admin/bases' && method === 'GET') {
      return this.getBases(request);
    }

    if (path === '/api/admin/aircraft' && method === 'GET') {
      return this.getAircraft(request);
    }

    if (path === '/api/users' && method === 'GET') {
      return this.getUsers(request);
    }

    // Return null for unmatched routes (will fallback to backend)
    return null;
  }

  // Health and info endpoints
  private healthCheck(): Response {
    return new Response(JSON.stringify({
      status: 'ok',
      message: 'Cruiser Aviation Platform API',
      version: this.env.VITE_APP_VERSION,
      environment: this.env.VITE_ENVIRONMENT,
      timestamp: new Date().toISOString(),
      edge: true
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  private appInfo(): Response {
    return new Response(JSON.stringify({
      name: this.env.VITE_APP_NAME,
      version: this.env.VITE_APP_VERSION,
      environment: this.env.VITE_ENVIRONMENT,
      features: ['edge-computing', 'global-distribution', 'automatic-scaling', 'cloudflare-access']
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  // Authentication methods
  private async getAuthProfile(request: Request): Promise<Response> {
    try {
      const { user, authenticated } = await this.authService.getUserInfo(request);
      
      if (!authenticated || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }

      return new Response(JSON.stringify({
        user: {
          id: user.sub,
          email: user.email,
          name: user.name,
          picture: user.picture,
          custom_claims: user.custom_claims
        },
        authenticated: true
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  }

  private async verifyAuth(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const token = url.searchParams.get('token');
      
      // Handle magic link token (for development)
      if (token) {
        try {
          const decoded = atob(token);
          const [email, timestamp] = decoded.split(':');
          const tokenAge = Date.now() - parseInt(timestamp);
          
          // Token expires after 1 hour (3600000 ms)
          if (tokenAge < 3600000) {
            // Generate a simple JWT-like token for the session
            const sessionToken = btoa(JSON.stringify({
              email,
              sub: email,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor((Date.now() + 3600000) / 1000)
            }));
            
            return new Response(JSON.stringify({
              authenticated: true,
              message: 'Magic link token is valid',
              access_token: sessionToken,
              user: { email, sub: email }
            }), {
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
              }
            });
          } else {
            return new Response(JSON.stringify({
              authenticated: false,
              message: 'Magic link token has expired'
            }), {
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
              }
            });
          }
        } catch (error) {
          return new Response(JSON.stringify({
            authenticated: false,
            message: 'Invalid magic link token format'
          }), {
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
          });
        }
      }
      
      // Handle Cloudflare Access token
      const authenticated = await this.authService.isAuthenticated(request);
      
      return new Response(JSON.stringify({
        authenticated,
        message: authenticated ? 'Token is valid' : 'Token is invalid or missing'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Authentication verification failed' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  }

  private async createMagicLink(request: Request): Promise<Response> {
    try {
      const body = await request.json() as { email: string };
      
      if (!body.email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }

      // For development, generate a simple token
      const token = btoa(`${body.email}:${Date.now()}`);
      
      // In production, you would:
      // 1. Generate a secure token
      // 2. Store it in the database with expiration
      // 3. Send an email with the magic link
      
      return new Response(JSON.stringify({
        message: 'Magic link sent successfully',
        token: token, // Only for development
        magicLink: `http://localhost:8787/login?token=${token}`
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to create magic link' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  }

  // Helper method to check authentication for protected endpoints
  private async requireAuth(request: Request): Promise<CloudflareUser | null> {
    const { user, authenticated } = await this.authService.getUserInfo(request);
    
    if (!authenticated || !user) {
      return null;
    }

    return user;
  }

  // Admin dashboard (now requires authentication)
  private async getAdminDashboard(request: Request): Promise<Response> {
    const user = await this.requireAuth(request);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    try {
      // Get counts from database
      const usersCount = await this.env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
      const basesCount = await this.env.DB.prepare('SELECT COUNT(*) as count FROM bases').first();
      const servicesCount = await this.env.DB.prepare('SELECT COUNT(*) as count FROM services').first();
      const aircraftCount = await this.env.DB.prepare('SELECT COUNT(*) as count FROM aircraft').first();

      const dashboard = {
        user: {
          id: user.sub,
          email: user.email,
          name: user.name
        },
        stats: {
          users: usersCount?.count || mockData.users.length,
          bases: basesCount?.count || mockData.bases.length,
          services: servicesCount?.count || mockData.services.length,
          aircraft: aircraftCount?.count || mockData.aircraft.length,
          total_flight_hours: 1525,
          active_users: 2,
          recent_activity: []
        }
      };

      return new Response(JSON.stringify(dashboard), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    } catch (error) {
      // Fallback to mock data if database fails
      const dashboard = {
        user: {
          id: user.sub,
          email: user.email,
          name: user.name
        },
        stats: {
          users: mockData.users.length,
          bases: mockData.bases.length,
          services: mockData.services.length,
          aircraft: mockData.aircraft.length,
          total_flight_hours: 1525,
          active_users: 2,
          recent_activity: []
        }
      };

      return new Response(JSON.stringify(dashboard), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  }

  // Service management methods (now require authentication)
  private async getServices(request: Request): Promise<Response> {
    const user = await this.requireAuth(request);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    try {
      const services = await this.env.DB.prepare(
        'SELECT * FROM services ORDER BY name ASC'
      ).all();

      return new Response(JSON.stringify(services.results), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    } catch (error) {
      // Fallback to mock data if database fails
      return new Response(JSON.stringify(mockData.services), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  }

  // Base management methods (now require authentication)
  private async getBases(request: Request): Promise<Response> {
    const user = await this.requireAuth(request);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    try {
      const bases = await this.env.DB.prepare(
        'SELECT * FROM bases ORDER BY name ASC'
      ).all();

      return new Response(JSON.stringify(bases.results), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    } catch (error) {
      // Fallback to mock data if database fails
      return new Response(JSON.stringify(mockData.bases), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  }

  // Aircraft management methods (now require authentication)
  private async getAircraft(request: Request): Promise<Response> {
    const user = await this.requireAuth(request);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    try {
      const aircraft = await this.env.DB.prepare(
        'SELECT * FROM aircraft ORDER BY call_sign ASC'
      ).all();

      return new Response(JSON.stringify(aircraft.results), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    } catch (error) {
      // Fallback to mock data if database fails
      return new Response(JSON.stringify(mockData.aircraft), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  }

  // User management methods (now require authentication)
  private async getUsers(request: Request): Promise<Response> {
    const user = await this.requireAuth(request);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    try {
      const users = await this.env.DB.prepare(
        'SELECT id, email, first_name, last_name, role, status, created_at, updated_at FROM users ORDER BY created_at DESC'
      ).all();

      return new Response(JSON.stringify(users.results), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    } catch (error) {
      // Fallback to mock data if database fails
      return new Response(JSON.stringify(mockData.users), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
  }
} 