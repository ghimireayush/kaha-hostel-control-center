import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntityWithCustomId } from '../../common/entities/base.entity';
import { Room } from './room.entity';

export enum PricingModel {
  MONTHLY = 'monthly',
  DAILY = 'daily',
  SEMESTER = 'semester',
  ANNUAL = 'annual'
}

@Entity('room_types')
@Index(['name'], { unique: true })
@Index(['isActive'])
export class RoomType extends BaseEntityWithCustomId {
  @Column({ length: 100, unique: true })
  name: string; // Dormitory, Suite, Private, etc.

  @Column({ length: 50, nullable: true })
  code: string;

  @Column({ name: 'base_monthly_rate', type: 'decimal', precision: 10, scale: 2 })
  baseMonthlyRate: number;

  @Column({ name: 'base_daily_rate', type: 'decimal', precision: 10, scale: 2 })
  baseDailyRate: number;

  @Column({
    name: 'pricing_model',
    type: 'enum',
    enum: PricingModel,
    default: PricingModel.MONTHLY
  })
  pricingModel: PricingModel;

  @Column({ name: 'default_bed_count', type: 'int', default: 1 })
  defaultBedCount: number;

  @Column({ name: 'max_occupancy', type: 'int', default: 1 })
  maxOccupancy: number;

  @Column({ name: 'security_deposit', type: 'decimal', precision: 10, scale: 2, default: 0 })
  securityDeposit: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  features: string[];

  // Relations
  @OneToMany(() => Room, room => room.roomType)
  rooms: Room[];
}