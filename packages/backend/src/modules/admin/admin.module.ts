import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Base } from './entities/base.entity';
import { Service } from './entities/service.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Aircraft } from './entities/aircraft.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Base, Service, Aircraft]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {} 