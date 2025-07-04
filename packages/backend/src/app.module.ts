import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
// import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseConfig } from '@config/database.config';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
// import { OnboardingModule } from '@modules/onboarding/onboarding.module';
// import { FlightsModule } from '@modules/flights/flights.module';
// import { InvoicesModule } from '@modules/invoices/invoices.module';
import { AdminModule } from '@modules/admin/admin.module';
import { VeriffModule } from './modules/veriff/veriff.module';
// import { NotificationsModule } from '@modules/notifications/notifications.module';
// import { FilesModule } from '@modules/files/files.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Background jobs - temporarily disabled for development
    // BullModule.forRoot({
    //   redis: {
    //     host: process.env.REDIS_HOST || 'localhost',
    //     port: parseInt(process.env.REDIS_PORT) || 6379,
    //   },
    // }),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    UsersModule,
    // OnboardingModule,
    // FlightsModule,
    // InvoicesModule,
    AdminModule,
    VeriffModule,
    // NotificationsModule,
    // FilesModule,
  ],
})
export class AppModule {} 