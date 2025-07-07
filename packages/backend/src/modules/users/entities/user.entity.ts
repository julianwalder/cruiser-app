import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  USER = 'user',
  INSTRUCTOR = 'instructor',
  BASEMANAGER = 'basemanager',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  VERIFIED = 'verified',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  nationalId: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  sex: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  // ID Document fields
  @Column({ nullable: true })
  idDocumentUrl: string;

  @Column({ type: 'date', nullable: true })
  idIssuedDate: Date;

  @Column({ type: 'date', nullable: true })
  idExpiryDate: Date;

  @Column({ nullable: true })
  idIssuingAuthority: string;

  // Medical Certificate fields
  @Column({ nullable: true })
  medicalCertificateUrl: string;

  @Column({ nullable: true })
  medicalCertificateNumber: string;

  @Column({ type: 'date', nullable: true })
  medicalExamDate: Date;

  @Column({ type: 'date', nullable: true })
  medicalIssueDate: Date;

  @Column({ type: 'date', nullable: true })
  medicalExpiryDate: Date;

  // Verification flags
  @Column({ default: false })
  isIdVerified: boolean;

  @Column({ default: false })
  isMedicalVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  // Veriff integration fields
  @Column({ default: false })
  veriffVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  veriffVerifiedAt: Date;

  @Column({ type: 'json', nullable: true })
  veriffData: any;

  // PPL specific fields
  @Column({ default: false })
  hasPPL: boolean;

  @Column({ nullable: true })
  pplNumber: string;

  @Column({ type: 'date', nullable: true })
  pplIssueDate: Date;

  @Column({ type: 'date', nullable: true })
  pplExpiryDate: Date;

  // Flight school enrollment
  @Column({ nullable: true })
  baseId: string;

  @Column({ nullable: true })
  enrollmentDate: Date;

  @Column({ default: 0 })
  totalFlightHours: number;

  @Column({ default: 0 })
  creditedHours: number;

  // Firebase UID for authentication
  @Column({ nullable: true })
  firebaseUid: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  // Virtual getter for full name
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  // Virtual getter for verification status
  get isFullyVerified(): boolean {
    return this.isIdVerified && this.isMedicalVerified && this.isPhoneVerified;
  }

  // Virtual getter for document expiry warnings
  get hasExpiringDocuments(): boolean {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return (
      (this.idExpiryDate && this.idExpiryDate <= thirtyDaysFromNow) ||
      (this.medicalExpiryDate && this.medicalExpiryDate <= thirtyDaysFromNow) ||
      (this.pplExpiryDate && this.pplExpiryDate <= thirtyDaysFromNow)
    );
  }
} 