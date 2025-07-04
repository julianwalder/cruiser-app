import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('bases')
export class Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Location information
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

  // GPS coordinates
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  // AIP (Aeronautical Information Publication) data
  @Column({ nullable: true })
  icaoCode: string;

  @Column({ nullable: true })
  iataCode: string;

  @Column({ nullable: true })
  runwayLength: string;

  @Column({ nullable: true })
  runwaySurface: string;

  @Column({ nullable: true })
  elevation: string;

  @Column({ nullable: true })
  frequency: string;

  @Column({ nullable: true })
  operatingHours: string;

  // Contact information
  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  // Base image
  @Column({ nullable: true })
  imageUrl: string;

  // Base manager
  @Column({ nullable: true })
  managerId: string;

  // Status
  @Column({ default: true })
  isActive: boolean;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual getter for full address
  get fullAddress(): string {
    const parts = [this.address, this.city, this.region, this.country, this.postalCode];
    return parts.filter(Boolean).join(', ');
  }

  // Virtual getter for coordinates
  get coordinates(): { lat: number; lng: number } | null {
    if (this.latitude && this.longitude) {
      return { lat: this.latitude, lng: this.longitude };
    }
    return null;
  }
} 