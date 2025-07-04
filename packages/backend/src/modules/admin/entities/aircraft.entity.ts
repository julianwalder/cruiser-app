import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('aircraft')
export class Aircraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  callSign: string;

  @Column()
  type: string;

  @Column()
  manufacturer: string;

  @Column()
  model: string;

  @Column({ type: 'int', default: 4 })
  seats: number;

  @Column({ type: 'int', default: 0 })
  maxRange: number;

  @Column({ type: 'int', default: 0 })
  cruiseSpeed: number;

  @Column({ type: 'int', default: 0 })
  fuelCapacity: number;

  @Column({ type: 'int', default: 2020 })
  yearManufactured: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  baseId: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'date', nullable: true })
  maintenanceDue: Date;

  @Column({ type: 'int', nullable: true })
  totalFlightHours: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 