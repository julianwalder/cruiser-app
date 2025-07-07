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
  // Cloudflare Access specific fields
  cf?: {
    identity?: {
      user_uuid?: string;
      email?: string;
      name?: string;
      groups?: string[];
    };
  };
}

export interface CloudflareAuthConfig {
  jwtSecret: string;
  audience: string;
  teamDomain: string;
}

export enum UserRole {
  USER = 'user',
  INSTRUCTOR = 'instructor',
  BASEMANAGER = 'basemanager',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role: UserRole;
  groups: string[];
  authenticated: boolean;
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

  /**
   * Determine user role from Cloudflare Access groups
   */
  determineUserRole(user: CloudflareUser): UserRole {
    const groups = user.cf?.identity?.groups || [];
    
    // Role hierarchy: superadmin > admin > basemanager > instructor > user
    if (groups.includes('superadmin') || groups.includes('super_admin')) {
      return UserRole.SUPERADMIN;
    }
    if (groups.includes('admin') || groups.includes('administrators')) {
      return UserRole.ADMIN;
    }
    if (groups.includes('basemanager') || groups.includes('base_manager')) {
      return UserRole.BASEMANAGER;
    }
    if (groups.includes('instructor') || groups.includes('flight_instructor')) {
      return UserRole.INSTRUCTOR;
    }
    
    return UserRole.USER;
  }

  /**
   * Get authenticated user with role information
   */
  async getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
    const user = await this.getUserFromRequest(request);
    
    if (!user) {
      return null;
    }

    return {
      id: user.sub,
      email: user.email,
      name: user.name || user.cf?.identity?.name,
      picture: user.picture,
      role: this.determineUserRole(user),
      groups: user.cf?.identity?.groups || [],
      authenticated: true,
    };
  }

  /**
   * Check if user has required role
   */
  hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.USER]: 1,
      [UserRole.INSTRUCTOR]: 2,
      [UserRole.BASEMANAGER]: 3,
      [UserRole.ADMIN]: 4,
      [UserRole.SUPERADMIN]: 5,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Check if user has any of the required roles
   */
  hasAnyRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.some(role => this.hasRequiredRole(userRole, role));
  }

  /**
   * Create authentication middleware for role-based access
   */
  createAuthMiddleware(requiredRole: UserRole = UserRole.USER) {
    return async (request: Request): Promise<Response | null> => {
      const user = await this.getAuthenticatedUser(request);
      
      if (!user) {
        return new Response(JSON.stringify({ 
          error: 'Authentication required',
          message: 'Please log in to access this resource'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!this.hasRequiredRole(user.role, requiredRole)) {
        return new Response(JSON.stringify({ 
          error: 'Insufficient permissions',
          message: `This resource requires ${requiredRole} role or higher`,
          userRole: user.role
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return null; // Continue to handler
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