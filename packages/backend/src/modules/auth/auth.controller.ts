import { Controller, Post, Body, Get, UseGuards, Request, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('magic-link')
  async sendMagicLink(@Body() body: { email: string }) {
    if (!body.email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }
    return this.authService.sendMagicLink(body.email);
  }

  @Get('health')
  async health() {
    return { status: 'ok', message: 'Auth service is running' };
  }

  @Get('verify')
  async verifyMagicLink(@Query('token') token: string) {
    if (!token) {
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    }
    return this.authService.verifyMagicLink(token);
  }

  @Post('verify')
  async verifyMagicLinkPost(@Body() body: { token: string }) {
    if (!body.token) {
      throw new HttpException('Token is required', HttpStatus.BAD_REQUEST);
    }
    return this.authService.verifyMagicLink(body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
} 