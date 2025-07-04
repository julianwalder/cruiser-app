import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  DUE = 'due',
  OVERDUE = 'overdue',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum InvoiceType {
  B2C = 'b2c',
  B2B = 'b2b',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CARD = 'card',
  ONLINE = 'online',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Invoice details
  @Column({ unique: true })
  invoiceNumber: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 19 })
  vatRate: number;

  // Invoice type and status
  @Column({
    type: 'enum',
    enum: InvoiceType,
    default: InvoiceType.B2C,
  })
  type: InvoiceType;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  // Dates
  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  // B2B specific fields
  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  companyVat: string;

  @Column({ nullable: true })
  companyAddress: string;

  @Column({ nullable: true })
  companyRegNumber: string;

  // SmartBill integration
  @Column({ nullable: true })
  smartbillId: string;

  @Column({ nullable: true })
  smartbillUrl: string;

  @Column({ nullable: true })
  smartbillPdfUrl: string;

  // Payment information
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  paymentReference: string;

  @Column({ nullable: true })
  bankTransactionId: string;

  // Flight school specific
  @Column({ nullable: true })
  baseId: string;

  @Column({ nullable: true })
  serviceId: string;

  @Column({ nullable: true })
  installmentNumber: number;

  @Column({ nullable: true })
  totalInstallments: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  creditedHours: number;

  // Notes and remarks
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual getter for overdue status
  get isOverdue(): boolean {
    return this.status === InvoiceStatus.OVERDUE || 
           (this.status === InvoiceStatus.DUE && new Date() > this.dueDate);
  }

  // Virtual getter for days overdue
  get daysOverdue(): number {
    if (this.isOverdue) {
      const now = new Date();
      const due = new Date(this.dueDate);
      return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  // Virtual getter for payment status
  get isPaid(): boolean {
    return this.status === InvoiceStatus.PAID;
  }

  // Virtual getter for installment info
  get installmentInfo(): string {
    if (this.installmentNumber && this.totalInstallments) {
      return `${this.installmentNumber}/${this.totalInstallments}`;
    }
    return '';
  }
} 