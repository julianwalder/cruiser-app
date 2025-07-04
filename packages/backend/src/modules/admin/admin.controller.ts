import { Controller, Get, Post, Put, Delete, Body, Request, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminService } from './admin.service';
import { Base } from './entities/base.entity';
import { User } from '../users/entities/user.entity';
import { Aircraft } from './entities/aircraft.entity';
import { Service } from './entities/service.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    console.log('Admin dashboard request - no auth required');
    return this.adminService.getDashboardStats();
  }

  @Get('test')
  async test() {
    console.log('Admin test endpoint called');
    return { message: 'Admin test endpoint working', timestamp: new Date().toISOString() };
  }

  @Get('users')
  async getUsers() {
    console.log('Admin users request - no auth required');
    return this.adminService.getUsers();
  }

  @Post('users')
  async createUser(@Body() userData: Partial<User>) {
    console.log('Admin create user request - no auth required');
    return this.adminService.createUser(userData);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() userData: Partial<User>) {
    console.log('Admin update user request - no auth required');
    return this.adminService.updateUser(id, userData);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    console.log('Admin delete user request - no auth required');
    return this.adminService.deleteUser(id);
  }

  @Get('bases')
  async getBases() {
    console.log('Admin bases request - no auth required');
    return this.adminService.getBases();
  }

  @Post('bases')
  async createBase(@Body() baseData: Partial<Base>) {
    console.log('Admin create base request - no auth required');
    return this.adminService.createBase(baseData);
  }

  @Put('bases/:id')
  async updateBase(@Param('id') id: string, @Body() baseData: Partial<Base>) {
    console.log('Admin update base request - no auth required');
    return this.adminService.updateBase(id, baseData);
  }

  @Delete('bases/:id')
  async deleteBase(@Param('id') id: string) {
    console.log('Admin delete base request - no auth required');
    return this.adminService.deleteBase(id);
  }

  @Get('services')
  async getServices() {
    console.log('Admin services request - no auth required');
    return this.adminService.getServices();
  }

  @Post('services')
  async createService(@Body() serviceData: Partial<Service>) {
    console.log('Admin create service request - no auth required');
    return this.adminService.createService(serviceData);
  }

  @Put('services/:id')
  async updateService(@Param('id') id: string, @Body() serviceData: Partial<Service>) {
    console.log('Admin update service request - no auth required');
    return this.adminService.updateService(id, serviceData);
  }

  @Delete('services/:id')
  async deleteService(@Param('id') id: string) {
    console.log('Admin delete service request - no auth required');
    return this.adminService.deleteService(id);
  }

  @Post('bases/upload-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/bases',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadBaseImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    // Return the URL to access the image
    const url = `/uploads/bases/${file.filename}`;
    return { url };
  }

  @Post('users/upload-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/users',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadUserImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    // Return the URL to access the image
    const url = `/uploads/users/${file.filename}`;
    return { url };
  }

  @Post('aircraft/upload-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/aircraft',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadAircraftImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    // Return the URL to access the image
    const url = `/uploads/aircraft/${file.filename}`;
    return { url };
  }

  @Post('services/upload-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/services',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadServiceImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    // Return the URL to access the image
    const url = `/uploads/services/${file.filename}`;
    return { url };
  }

  @Post('seed-users')
  async seedUsers() {
    console.log('Admin seed users request - no auth required');
    return this.adminService.seedUsers();
  }

  @Get('aircraft')
  async getAircraft() {
    console.log('Admin aircraft request - no auth required');
    return this.adminService.getAircraft();
  }

  @Post('aircraft')
  async createAircraft(@Body() aircraftData: Partial<Aircraft>) {
    return this.adminService.createAircraft(aircraftData);
  }

  @Put('aircraft/:id')
  async updateAircraft(@Param('id') id: string, @Body() aircraftData: Partial<Aircraft>) {
    return this.adminService.updateAircraft(id, aircraftData);
  }

  @Delete('aircraft/:id')
  async deleteAircraft(@Param('id') id: string) {
    return this.adminService.deleteAircraft(id);
  }
} 