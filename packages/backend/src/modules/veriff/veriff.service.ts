import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class VeriffService {
  private readonly logger = new Logger(VeriffService.name);
  private readonly veriffApiUrl = 'https://api.veriff.me';
  private readonly veriffPublicKey: string;
  private readonly veriffPrivateKey: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.veriffPublicKey = this.configService.get<string>('VERIFF_PUBLIC_KEY') || '';
    this.veriffPrivateKey = this.configService.get<string>('VERIFF_PRIVATE_KEY') || '';
  }

  async createSession(userId: string) {
    // Generate a unique session ID
    const sessionId = `session_${Date.now()}_${userId}`;
    
    console.log(`[VeriffService] Created Veriff session for user ${userId}: ${sessionId}`);
    
    // In a real implementation, you would call Veriff API to create a session
    // For now, return a mock session
    return {
      sessionId,
      url: `https://veriff.com/session/${sessionId}`,
      status: 'created'
    };
  }

  async processWebhook(webhookData: any) {
    console.log('[VeriffService] Processing webhook:', webhookData);
    
    try {
      const { verification } = webhookData;
      
      if (verification.status === 'approved') {
        // Extract user data from Veriff response
        const person = verification.person;
        const document = verification.document;
        
        // Extract session ID to find the user
        const sessionId = verification.id;
        const userId = this.extractUserIdFromSessionId(sessionId);
        
        if (userId) {
          // Update user profile with Veriff data
          await this.updateUserWithVeriffData(userId, person, document);
        }
      }
    } catch (error) {
      console.error('[VeriffService] Error processing webhook:', error);
      throw error;
    }
  }

  async getSessionStatus(sessionId: string) {
    // In a real implementation, you would call Veriff API to get session status
    // For now, return a mock status
    return {
      sessionId,
      status: 'approved',
      person: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        address: {
          street: '123 Main St',
          city: 'New York',
          country: 'US',
          postalCode: '10001'
        }
      }
    };
  }

  private extractUserIdFromSessionId(sessionId: string): string | null {
    // Extract userId from session ID format: session_timestamp_userId
    const parts = sessionId.split('_');
    if (parts.length >= 3) {
      return parts[2];
    }
    return null;
  }

  private async updateUserWithVeriffData(userId: string, person: any, document: any) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        console.error(`[VeriffService] User not found: ${userId}`);
        return;
      }

      // Update user profile with Veriff data
      const updateData: Partial<User> = {};
      
      if (person.firstName) updateData.firstName = person.firstName;
      if (person.lastName) updateData.lastName = person.lastName;
      if (person.dateOfBirth) updateData.dateOfBirth = person.dateOfBirth;
      
      // Store address information (you might need to add address fields to User entity)
      if (person.address) {
        // For now, store as JSON in a custom field or add address fields to User entity
        updateData.veriffData = JSON.stringify({
          address: person.address,
          document: document,
          verifiedAt: new Date().toISOString()
        });
      }

      // Mark user as verified
      updateData.veriffVerified = true;
      updateData.veriffVerifiedAt = new Date();

      await this.userRepository.update(userId, updateData);
      
      console.log(`[VeriffService] Updated user ${userId} with Veriff data`);
    } catch (error) {
      console.error(`[VeriffService] Error updating user ${userId}:`, error);
      throw error;
    }
  }
} 