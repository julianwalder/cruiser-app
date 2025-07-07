import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  BASEMANAGER = 'basemanager',
  INSTRUCTOR = 'instructor',
  USER = 'user',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  VERIFIED = 'verified',
}

@Injectable()
export class AuthService {
  private magicLinkTokens = new Map<string, { email: string; expiresAt: Date }>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async sendMagicLink(email: string) {
    // Generate a secure token
    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    // Store the token temporarily (in production, use Redis or database)
    this.magicLinkTokens.set(token, { email, expiresAt });

    // In production, send actual email here
    // For now, we'll just log it and return the token for testing
    console.log(`Magic link for ${email}: ${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/verify?token=${token}`);

    return { 
      message: 'Magic link sent to ' + email,
      token: token, // Remove this in production
      expiresAt 
    };
  }

  async verifyMagicLink(token: string) {
    const tokenData = this.magicLinkTokens.get(token);
    
    if (!tokenData) {
      throw new UnauthorizedException('Invalid or expired magic link');
    }

    if (new Date() > tokenData.expiresAt) {
      this.magicLinkTokens.delete(token);
      throw new UnauthorizedException('Magic link has expired');
    }

    // Remove the token after successful verification
    this.magicLinkTokens.delete(token);

    // Get user data
    const user = await this.validateUser(tokenData.email);

    // Create a JWT token for the user
    const payload = { 
      email: tokenData.email, 
      sub: user.id,
      type: 'magic_link',
      role: user.role,
      userId: user.id
    };

    const jwtToken = this.jwtService.sign(payload);

    return { 
      message: 'Magic link verified successfully',
      access_token: jwtToken,
      user: user
    };
  }

  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async validateUser(email: string): Promise<any> {
    // Mock user database - in production, this would query your actual database
    const mockUsers = {
      'superadmin@cruiser.com': {
        id: '1',
        email: email,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPERADMIN,
        status: UserStatus.ACTIVE,
        isFullyVerified: true,
        hasPPL: true,
        creditedHours: 1000,
        totalFlightHours: 1500,
        firebaseUid: 'super-admin-firebase-uid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: ['*'] // Superadmin has all permissions
      },
      'admin@cruiser.com': {
        id: '2',
        email: email,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isFullyVerified: true,
        hasPPL: true,
        creditedHours: 800,
        totalFlightHours: 1200,
        firebaseUid: 'admin-firebase-uid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: ['users:read', 'users:write', 'bases:read', 'bases:write', 'aircraft:read', 'aircraft:write', 'services:read', 'services:write']
      },
      'basemanager@cruiser.com': {
        id: '3',
        email: email,
        firstName: 'Base',
        lastName: 'Manager',
        role: UserRole.BASEMANAGER,
        status: UserStatus.ACTIVE,
        isFullyVerified: true,
        hasPPL: true,
        creditedHours: 600,
        totalFlightHours: 900,
        firebaseUid: 'basemanager-firebase-uid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: ['users:read', 'bases:read', 'aircraft:read', 'aircraft:write', 'services:read']
      },
      'instructor@cruiser.com': {
        id: '4',
        email: email,
        firstName: 'Flight',
        lastName: 'Instructor',
        role: UserRole.INSTRUCTOR,
        status: UserStatus.ACTIVE,
        isFullyVerified: true,
        hasPPL: true,
        creditedHours: 400,
        totalFlightHours: 600,
        firebaseUid: 'instructor-firebase-uid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: ['users:read', 'aircraft:read', 'services:read']
      },
      'user@cruiser.com': {
        id: '5',
        email: email,
        firstName: 'Regular',
        lastName: 'User',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        isFullyVerified: true,
        hasPPL: false,
        creditedHours: 0,
        totalFlightHours: 0,
        firebaseUid: 'user-firebase-uid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: ['services:read']
      }
    };

    const user = mockUsers[email];
    if (!user) {
      // Create a new user with default role
      return {
        id: Date.now().toString(),
        email: email,
        firstName: 'New',
        lastName: 'User',
        role: UserRole.USER,
        status: UserStatus.PENDING,
        isFullyVerified: false,
        hasPPL: false,
        creditedHours: 0,
        totalFlightHours: 0,
        firebaseUid: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: ['services:read']
      };
    }
    
    return user;
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.validateUser(payload.email);
      return { ...payload, user };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  hasPermission(user: any, permission: string): boolean {
    if (user.role === UserRole.SUPERADMIN) {
      return true; // Superadmin has all permissions
    }
    
    return user.permissions && user.permissions.includes(permission);
  }

  canAccessResource(user: any, resourceType: string, action: string): boolean {
    const permission = `${resourceType}:${action}`;
    return this.hasPermission(user, permission);
  }
} 