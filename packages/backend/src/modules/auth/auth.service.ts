import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
      sub: tokenData.email,
      type: 'magic_link',
      role: user.role
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
    // In a real app, validate against database
    // For now, return a mock user
    if (email === 'superadmin@cruiser.com') {
      return {
        id: '1',
        email: email,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        status: 'active',
        isFullyVerified: true,
        hasPPL: true,
        creditedHours: 1000,
        totalFlightHours: 1500,
        firebaseUid: 'super-admin-firebase-uid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    return {
      id: '1',
      email: email,
      firstName: 'John',
      lastName: 'Doe',
      role: 'student_pilot',
      status: 'active',
      isFullyVerified: true,
      hasPPL: false,
      creditedHours: 0,
      totalFlightHours: 0,
      firebaseUid: 'mock-firebase-uid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
} 