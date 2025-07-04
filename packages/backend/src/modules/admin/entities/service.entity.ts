import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ServiceType {
  FLIGHT_SCHOOL = 'flight_school',
  AIRCRAFT_RENTAL = 'aircraft_rental',
  INSTRUCTION = 'instruction',
  EXAM_PREPARATION = 'exam_preparation',
  THEORETICAL_COURSE = 'theoretical_course',
}

export enum PaymentPlan {
  FULL_PRICE = 'full_price',
  TWO_INSTALLMENTS = 'two_installments',
  FULL_PAYMENT = 'full_payment',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  type: ServiceType;

  // Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountedPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 19 })
  vatRate: number;

  // Flight hours
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 45 })
  includedHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  additionalHourPrice: number;

  // Payment plans
  @Column({
    type: 'enum',
    enum: PaymentPlan,
    default: PaymentPlan.FULL_PRICE,
  })
  defaultPaymentPlan: PaymentPlan;

  @Column({ type: 'json', nullable: true })
  paymentPlans: {
    [key in PaymentPlan]: {
      installments: number;
      months: number;
      discount: number;
    };
  };

  // Base association
  @Column({ nullable: true })
  baseId: string;

  // Duration and validity
  @Column({ nullable: true })
  durationMonths: number;

  @Column({ nullable: true })
  validityMonths: number;

  // Requirements
  @Column({ type: 'json', nullable: true })
  requirements: string[];

  @Column({ type: 'json', nullable: true })
  includedItems: string[];

  @Column({ type: 'json', nullable: true })
  excludedItems: string[];

  // Status
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual getter for total price with VAT
  get totalPrice(): number {
    return this.basePrice * (1 + this.vatRate / 100);
  }

  // Virtual getter for discounted total price
  get discountedTotalPrice(): number {
    if (this.discountedPrice) {
      return this.discountedPrice * (1 + this.vatRate / 100);
    }
    return this.totalPrice;
  }

  // Virtual getter for VAT amount
  get vatAmount(): number {
    return this.basePrice * (this.vatRate / 100);
  }

  // Virtual getter for payment plan options
  get availablePaymentPlans(): PaymentPlan[] {
    return Object.keys(this.paymentPlans || {}) as PaymentPlan[];
  }

  // Virtual getter for installment amount
  getInstallmentAmount(plan: PaymentPlan): number {
    const planConfig = this.paymentPlans?.[plan];
    if (!planConfig) return this.totalPrice;

    const discountedPrice = this.totalPrice * (1 - planConfig.discount / 100);
    return discountedPrice / planConfig.installments;
  }
} 