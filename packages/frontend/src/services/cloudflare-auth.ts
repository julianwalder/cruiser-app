import { jwtVerify } from 'jose';

export interface CloudflareUser {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  custom_claims?: Record<string, any>;
}

export interface CloudflareAuthConfig {
  jwtSecret: string;
  audience: string;
  teamDomain: string;
}

export class CloudflareAuthService {
  private config: CloudflareAuthConfig;

  constructor(config: CloudflareAuthConfig) {
    this.config = config;
  }

  /**
   * Verify Cloudflare Access JWT token
   */
  async verifyToken(token: string): Promise<CloudflareUser | null> {
    try {
      if (!this.config.jwtSecret || this.config.jwtSecret === 'your-cloudflare-access-jwt-secret-here') {
        console.warn('Cloudflare Access JWT secret not configured');
        return null;
      }

      const secret = new TextEncoder().encode(this.config.jwtSecret);
      
      const { payload } = await jwtVerify(token, secret, {
        issuer: `https://${this.config.teamDomain}`,
        audience: this.config.audience,
      });

      // Type assertion with proper casting
      return payload as unknown as CloudflareUser;
    } catch (error) {
      console.error('Failed to verify Cloudflare Access token:', error);
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get user from request headers
   */
  async getUserFromRequest(request: Request): Promise<CloudflareUser | null> {
    const authHeader = request.headers.get('Authorization');
    const token = this.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return null;
    }

    return this.verifyToken(token);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(request: Request): Promise<boolean> {
    const user = await this.getUserFromRequest(request);
    return user !== null;
  }

  /**
   * Get user info for API responses
   */
  async getUserInfo(request: Request): Promise<{ user: CloudflareUser | null; authenticated: boolean }> {
    const user = await this.getUserFromRequest(request);
    return {
      user,
      authenticated: user !== null
    };
  }
}

/**
 * Create Cloudflare Auth service from environment variables
 */
export function createCloudflareAuthService(env: {
  JWT_SECRET: string;
  VITE_CLOUDFLARE_ACCESS_AUD: string;
  VITE_CLOUDFLARE_ACCESS_TEAM_DOMAIN: string;
}): CloudflareAuthService {
  return new CloudflareAuthService({
    jwtSecret: env.JWT_SECRET,
    audience: env.VITE_CLOUDFLARE_ACCESS_AUD,
    teamDomain: env.VITE_CLOUDFLARE_ACCESS_TEAM_DOMAIN,
  });
} 