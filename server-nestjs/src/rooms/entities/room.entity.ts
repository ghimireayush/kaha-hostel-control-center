import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntityWithCustomId } from '../../common/entities/base.entity';
import { Student } from '../../students/entities/student.entity';
import { RoomAmenity } from './room-amenity.entity';
import { RoomLayout } from './room-layout.entity';
import { Building } from './building.entity';
import { RoomType } from './room-type.entity';

export enum RoomStatus {
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance',
  INACTIVE = 'Inactive',
  RESERVED = 'Reserved'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  MIXED = 'Mixed',
  ANY = 'Any'
}

export enum MaintenanceStatus {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  FAIR = 'Fair',
  UNDER_REPAIR = 'Under Repair',
  NEEDS_ATTENTION = 'Needs Attention'
}

@Entity('rooms')
@Index(['roomNumber'], { unique: true })
@Index(['status'])
@Index(['buildingId'])
@Index(['roomTypeId'])
@Index(['gender'])
export class Room extends BaseEntityWithCustomId {
  @Column({ length: 255 })
  name: string;

  @Column({ name: 'room_number', length: 20, unique: true })
  roomNumber: string;

  @Column({ name: 'bed_count', type: 'int', default: 1 })
  bedCount: number;

  @Column({ type: 'int', default: 0 })
  occupancy: number;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.ANY
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.ACTIVE
  })
  status: RoomStatus;

  @Column({
    name: 'maintenance_status',
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.GOOD
  })
  maintenanceStatus: MaintenanceStatus;

  @Column({ name: 'last_cleaned', type: 'date', nullable: true })
  lastCleaned: Date;

  @Column({ name: 'last_maintenance', type: 'date', nullable: true })
  lastMaintenance: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Foreign Keys
  @Column({ name: 'building_id', nullable: true })
  buildingId: string;

  @Column({ name: 'room_type_id', nullable: true })
  roomTypeId: string;

  // Computed Properties
  get availableBeds(): number {
    return this.bedCount - this.occupancy;
  }

  get isAvailable(): boolean {
    return this.status === RoomStatus.ACTIVE && this.availableBeds > 0;
  }

  // Relations
  @ManyToOne(() => Building, building => building.rooms, { nullable: true })
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @ManyToOne(() => RoomType, roomType => roomType.rooms, { nullable: true })
  @JoinColumn({ name: 'room_type_id' })
  roomType: RoomType;

  @OneToMany(() => Student, student => student.room)
  students: Student[];

  @OneToMany(() => RoomAmenity, amenity => amenity.room, { cascade: true })
  amenities: RoomAmenity[];

  @OneToMany(() => RoomLayout, layout => layout.room, { cascade: true })
  layouts: RoomLayout[];
}