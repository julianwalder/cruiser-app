/// <reference types="@cloudflare/workers-types" />

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// Cloudflare Workers environment interface
interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  CACHE: KVNamespace;
  NODE_ENV: string;
  JWT_SECRET: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
}

// Global app instance
let app: any = null;

async function bootstrap(env: Env) {
  if (!app) {
    // Set environment variables
    process.env.NODE_ENV = env.NODE_ENV || 'production';
    process.env.JWT_SECRET = env.JWT_SECRET;
    process.env.FIREBASE_PROJECT_ID = env.FIREBASE_PROJECT_ID;
    process.env.FIREBASE_PRIVATE_KEY = env.FIREBASE_PRIVATE_KEY;
    process.env.FIREBASE_CLIENT_EMAIL = env.FIREBASE_CLIENT_EMAIL;
    
    // Create NestJS app
    app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors({
      origin: true, // Allow all origins for now
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Global prefix
    app.setGlobalPrefix('api');

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Cruiser Aviation Platform API')
      .setDescription('API for managing flight school operations and aircraft rental')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('onboarding', 'User onboarding endpoints')
      .addTag('flights', 'Flight logging endpoints')
      .addTag('invoices', 'Invoicing endpoints')
      .addTag('admin', 'Admin management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Initialize the app
    await app.init();
  }
  
  return app;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Bootstrap the NestJS app
      const app = await bootstrap(env);
      
      // Get the HTTP adapter
      const httpAdapter = app.getHttpAdapter();
      
      // Create a mock request context for Cloudflare Workers
      const req = {
        method: request.method,
        url: new URL(request.url).pathname + new URL(request.url).search,
        headers: Object.fromEntries(request.headers.entries()),
        body: request.body,
        raw: request,
      };
      
      const res = {
        statusCode: 200,
        headers: {},
        body: '',
        setHeader: (name: string, value: string) => {
          res.headers[name] = value;
        },
        write: (chunk: string) => {
          res.body += chunk;
        },
        end: (chunk?: string) => {
          if (chunk) res.body += chunk;
        },
      };
      
      // Handle the request through NestJS
      await httpAdapter.handle(req, res);
      
      // Convert response to Cloudflare Workers Response
      const responseHeaders = new Headers(res.headers);
      return new Response(res.body, {
        status: res.statusCode,
        headers: responseHeaders,
      });
      
    } catch (error) {
      console.error('API Worker Error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString(),
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
  },
}; 