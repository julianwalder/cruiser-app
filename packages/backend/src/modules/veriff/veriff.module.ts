import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { VeriffController } from './veriff.controller';
import { VeriffService } from './veriff.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule
  ],
  controllers: [VeriffController],
  providers: [VeriffService],
  exports: [VeriffService],
})
export class VeriffModule {} 