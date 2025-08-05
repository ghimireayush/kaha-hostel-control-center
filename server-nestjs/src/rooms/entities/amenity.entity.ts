import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { RoomAmenity } from './room-amenity.entity';

export enum AmenityCategory {
  FURNITURE = 'furniture',
  ELECTRONICS = 'electronics',
  UTILITIES = 'utilities',
  COMFORT = 'comfort',
  SAFETY = 'safety',
  CONNECTIVITY = 'connectivity'
}

@Entity('amenities')
@Index(['name'], { unique: true })
@Index(['category'])
@Index(['isActive'])
export class Amenity extends BaseEntity {
  @Column({ length: 100, unique: true })
  name: string; // Wi-Fi, AC, TV, etc.

  @Column({
    type: 'enum',
    enum: AmenityCategory
  })
  category: AmenityCategory;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'maintenance_required', default: false })
  maintenanceRequired: boolean;

  @Column({ name: 'maintenance_frequency_days', type: 'int', nullable: true })
  maintenanceFrequencyDays: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>;

  // Relations
  @OneToMany(() => RoomAmenity, roomAmenity => roomAmenity.amenity)
  roomAmenities: RoomAmenity[];
}