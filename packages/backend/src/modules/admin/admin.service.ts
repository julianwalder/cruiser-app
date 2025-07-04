import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Base } from './entities/base.entity';
import { Service } from './entities/service.entity';
import { Aircraft } from './entities/aircraft.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Base)
    private basesRepository: Repository<Base>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(Aircraft)
    private aircraftRepository: Repository<Aircraft>,
  ) {}

  async getDashboardStats() {
    const [totalUsers, totalBases, totalServices] = await Promise.all([
      this.usersRepository.count(),
      this.basesRepository.count(),
      this.servicesRepository.count(),
    ]);

    const usersByRole = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const usersByStatus = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.status')
      .getRawMany();

    return {
      overview: {
        totalUsers,
        totalBases,
        totalServices,
      },
      usersByRole,
      usersByStatus,
      recentActivity: {
        // Placeholder for recent activity data
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  async getUsers() {
    return this.usersRepository.find({
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'status',
        'createdAt',
        'lastLoginAt',
        'imageUrl',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getBases() {
    return this.basesRepository.find({
      select: [
        'id',
        'name',
        'city',
        'country',
        'icaoCode',
        'isActive',
        'createdAt',
        'imageUrl',
      ],
      order: { name: 'ASC' },
    });
  }

  async getServices() {
    return this.servicesRepository.find({
      select: [
        'id',
        'name',
        'description',
        'type',
        'basePrice',
        'defaultPaymentPlan',
        'isActive',
        'imageUrl',
        'createdAt',
      ],
      order: { name: 'ASC' },
    });
  }

  async getAircraft() {
    return this.aircraftRepository.find({
      order: { callSign: 'ASC' },
    });
  }

  async createBase(baseData: Partial<Base>) {
    const base = this.basesRepository.create(baseData);
    return this.basesRepository.save(base);
  }

  async updateBase(id: string, baseData: Partial<Base>) {
    const base = await this.basesRepository.findOne({ where: { id } });
    if (!base) {
      throw new Error('Base not found');
    }
    
    Object.assign(base, baseData);
    return this.basesRepository.save(base);
  }

  async deleteBase(id: string) {
    const base = await this.basesRepository.findOne({ where: { id } });
    if (!base) {
      throw new Error('Base not found');
    }
    
    await this.basesRepository.remove(base);
    return { message: 'Base deleted successfully' };
  }

  async createUser(userData: Partial<User>) {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async updateUser(id: string, userData: Partial<User>) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    
    Object.assign(user, userData);
    return this.usersRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    
    await this.usersRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async seedUsers() {
    const sampleUsers = [
      {
        email: 'john.smith@cruiser.com',
        firstName: 'John',
        lastName: 'Smith',
        phoneNumber: '+1-555-0101',
        role: 'FLIGHT_INSTRUCTOR' as any,
        status: 'ACTIVE' as any,
        address: '123 Aviation Way',
        city: 'San Francisco',
        region: 'CA',
        country: 'USA',
        postalCode: '94102',
        nationality: 'American',
        dateOfBirth: new Date('1985-03-15'),
        nationalId: 'US123456789',
        sex: 'Male',
        hasPPL: true,
        pplNumber: 'PPL-123456',
        pplIssueDate: new Date('2010-06-20'),
        pplExpiryDate: new Date('2025-06-20'),
        medicalCertificateNumber: 'MED-2024-001',
        medicalExamDate: new Date('2024-01-15'),
        medicalIssueDate: new Date('2024-01-20'),
        medicalExpiryDate: new Date('2026-01-20'),
        totalFlightHours: 1250,
        creditedHours: 1200,
        isIdVerified: true,
        isMedicalVerified: true,
        isPhoneVerified: true,
        isEmailVerified: true
      },
      {
        email: 'sarah.johnson@cruiser.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phoneNumber: '+1-555-0102',
        role: 'STUDENT_PILOT' as any,
        status: 'ACTIVE' as any,
        address: '456 Flight Street',
        city: 'Los Angeles',
        region: 'CA',
        country: 'USA',
        postalCode: '90210',
        nationality: 'American',
        dateOfBirth: new Date('1995-08-22'),
        nationalId: 'US987654321',
        sex: 'Female',
        hasPPL: false,
        totalFlightHours: 45,
        creditedHours: 40,
        isIdVerified: true,
        isMedicalVerified: true,
        isPhoneVerified: true,
        isEmailVerified: true
      },
      {
        email: 'mike.chen@cruiser.com',
        firstName: 'Mike',
        lastName: 'Chen',
        phoneNumber: '+1-555-0103',
        role: 'PPL_PILOT' as any,
        status: 'VERIFIED' as any,
        address: '789 Pilot Avenue',
        city: 'Seattle',
        region: 'WA',
        country: 'USA',
        postalCode: '98101',
        nationality: 'American',
        dateOfBirth: new Date('1988-12-10'),
        nationalId: 'US456789123',
        sex: 'Male',
        hasPPL: true,
        pplNumber: 'PPL-789012',
        pplIssueDate: new Date('2015-09-12'),
        pplExpiryDate: new Date('2030-09-12'),
        medicalCertificateNumber: 'MED-2024-002',
        medicalExamDate: new Date('2024-02-10'),
        medicalIssueDate: new Date('2024-02-15'),
        medicalExpiryDate: new Date('2026-02-15'),
        totalFlightHours: 320,
        creditedHours: 300,
        isIdVerified: true,
        isMedicalVerified: true,
        isPhoneVerified: true,
        isEmailVerified: true
      },
      {
        email: 'emma.davis@cruiser.com',
        firstName: 'Emma',
        lastName: 'Davis',
        phoneNumber: '+1-555-0104',
        role: 'BASE_MANAGER' as any,
        status: 'ACTIVE' as any,
        address: '321 Airport Road',
        city: 'Phoenix',
        region: 'AZ',
        country: 'USA',
        postalCode: '85001',
        nationality: 'American',
        dateOfBirth: new Date('1982-05-18'),
        nationalId: 'US654321987',
        sex: 'Female',
        hasPPL: true,
        pplNumber: 'PPL-345678',
        pplIssueDate: new Date('2008-11-05'),
        pplExpiryDate: new Date('2023-11-05'),
        medicalCertificateNumber: 'MED-2024-003',
        medicalExamDate: new Date('2024-03-05'),
        medicalIssueDate: new Date('2024-03-10'),
        medicalExpiryDate: new Date('2026-03-10'),
        totalFlightHours: 850,
        creditedHours: 800,
        isIdVerified: true,
        isMedicalVerified: true,
        isPhoneVerified: true,
        isEmailVerified: true
      },
      {
        email: 'alex.rodriguez@cruiser.com',
        firstName: 'Alex',
        lastName: 'Rodriguez',
        phoneNumber: '+1-555-0105',
        role: 'STUDENT_PILOT' as any,
        status: 'PENDING' as any,
        address: '654 Training Lane',
        city: 'Miami',
        region: 'FL',
        country: 'USA',
        postalCode: '33101',
        nationality: 'American',
        dateOfBirth: new Date('1999-01-30'),
        nationalId: 'US789123456',
        sex: 'Male',
        hasPPL: false,
        totalFlightHours: 12,
        creditedHours: 10,
        isIdVerified: false,
        isMedicalVerified: false,
        isPhoneVerified: true,
        isEmailVerified: true
      }
    ];

    const createdUsers = [];
    const skippedUsers = [];

    for (const userData of sampleUsers) {
      const existingUser = await this.usersRepository.findOne({ 
        where: { email: userData.email } 
      });
      
      if (existingUser) {
        skippedUsers.push(userData.email);
        continue;
      }

      const user = this.usersRepository.create(userData);
      const savedUser = await this.usersRepository.save(user);
      createdUsers.push(savedUser);
    }

    return {
      message: 'User seeding completed',
      created: createdUsers.length,
      skipped: skippedUsers.length,
      createdUsers: createdUsers.map(u => ({ id: u.id, email: u.email, name: `${u.firstName} ${u.lastName}` })),
      skippedUsers
    };
  }

  async createAircraft(aircraftData: Partial<Aircraft>) {
    const aircraft = this.aircraftRepository.create(aircraftData);
    return this.aircraftRepository.save(aircraft);
  }

  async updateAircraft(id: string, aircraftData: Partial<Aircraft>) {
    const aircraft = await this.aircraftRepository.findOne({ where: { id } });
    if (!aircraft) {
      throw new Error('Aircraft not found');
    }
    
    Object.assign(aircraft, aircraftData);
    return this.aircraftRepository.save(aircraft);
  }

  async deleteAircraft(id: string) {
    const aircraft = await this.aircraftRepository.findOne({ where: { id } });
    if (!aircraft) {
      throw new Error('Aircraft not found');
    }
    
    await this.aircraftRepository.remove(aircraft);
    return { message: 'Aircraft deleted successfully' };
  }

  async createService(serviceData: Partial<Service>) {
    const service = this.servicesRepository.create(serviceData);
    return this.servicesRepository.save(service);
  }

  async updateService(id: string, serviceData: Partial<Service>) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) {
      throw new Error('Service not found');
    }
    
    Object.assign(service, serviceData);
    return this.servicesRepository.save(service);
  }

  async deleteService(id: string) {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) {
      throw new Error('Service not found');
    }
    
    await this.servicesRepository.remove(service);
    return { message: 'Service deleted successfully' };
  }
} 