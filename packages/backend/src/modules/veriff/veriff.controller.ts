import { Controller, Post, Get, Body, Param, Req, Res } from '@nestjs/common';
import { VeriffService } from './veriff.service';
import { Request, Response } from 'express';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('veriff')
export class VeriffController {
  constructor(private readonly veriffService: VeriffService) {}

  @Get('test')
  test() {
    return { message: 'Veriff controller is working' };
  }

  @Post('create-session')
  // @UseGuards(JwtAuthGuard)
  async createSession(@Body() body: { userId: string }) {
    return this.veriffService.createSession(body.userId);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    try {
      // Verify webhook signature (implement proper verification)
      const signature = req.headers['x-veriff-signature'];
      
      // Process the webhook
      await this.veriffService.processWebhook(body);
      
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  @Get('session/:sessionId/status')
  // @UseGuards(JwtAuthGuard)
  async getSessionStatus(@Param('sessionId') sessionId: string) {
    return this.veriffService.getSessionStatus(sessionId);
  }
} 