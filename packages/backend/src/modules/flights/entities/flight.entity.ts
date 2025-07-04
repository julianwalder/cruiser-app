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

export enum FlightStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('flights')
export class Flight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Flight details
  @Column({ nullable: true })
  flightNumber: string;

  @Column({ type: 'timestamp' })
  departureTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  arrivalTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  durationMinutes: number;

  // Airfields
  @Column({ nullable: true })
  departureAirfield: string;

  @Column({ nullable: true })
  departureAirfieldIcao: string;

  @Column({ nullable: true })
  arrivalAirfield: string;

  @Column({ nullable: true })
  arrivalAirfieldIcao: string;

  // GPS coordinates
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  departureLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  departureLongitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  arrivalLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  arrivalLongitude: number;

  // Hobbs meter readings
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hobbsDeparture: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hobbsArrival: number;

  @Column({ nullable: true })
  hobbsDeparturePhotoUrl: string;

  @Column({ nullable: true })
  hobbsArrivalPhotoUrl: string;

  // Aircraft information
  @Column({ nullable: true })
  aircraftId: string;

  @Column({ nullable: true })
  aircraftRegistration: string;

  // Flight status
  @Column({
    type: 'enum',
    enum: FlightStatus,
    default: FlightStatus.PLANNED,
  })
  status: FlightStatus;

  // Flight type and purpose
  @Column({ nullable: true })
  flightType: string; // training, rental, personal, etc.

  @Column({ nullable: true })
  purpose: string; // solo, dual, cross-country, etc.

  // Instructor information (for training flights)
  @Column({ nullable: true })
  instructorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'instructorId' })
  instructor: User;

  // Weather and conditions
  @Column({ nullable: true })
  weatherConditions: string;

  @Column({ nullable: true })
  visibility: string;

  @Column({ nullable: true })
  windDirection: string;

  @Column({ nullable: true })
  windSpeed: string;

  // Notes and remarks
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  // Verification
  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual getter for flight duration
  get duration(): number {
    if (this.arrivalTime && this.departureTime) {
      return Math.round((this.arrivalTime.getTime() - this.departureTime.getTime()) / (1000 * 60));
    }
    return this.durationMinutes || 0;
  }

  // Virtual getter for hobbs difference
  get hobbsDifference(): number {
    if (this.hobbsArrival && this.hobbsDeparture) {
      return this.hobbsArrival - this.hobbsDeparture;
    }
    return 0;
  }

  // Virtual getter for flight status
  get isCompleted(): boolean {
    return this.status === FlightStatus.COMPLETED;
  }

  // Virtual getter for flight date
  get flightDate(): Date {
    return this.departureTime;
  }
} 