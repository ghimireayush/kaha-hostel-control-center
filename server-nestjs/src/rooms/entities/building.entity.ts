import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntityWithCustomId } from '../../common/entities/base.entity';
import { Room } from './room.entity';

export enum BuildingStatus {
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance',
  INACTIVE = 'Inactive'
}

@Entity('buildings')
@Index(['name'], { unique: true })
@Index(['status'])
export class Building extends BaseEntityWithCustomId {
  @Column({ length: 255, unique: true })
  name: string;

  @Column({ length: 100, nullable: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'total_floors', type: 'int', default: 1 })
  totalFloors: number;

  @Column({ name: 'total_rooms', type: 'int', default: 0 })
  totalRooms: number;

  @Column({
    type: 'enum',
    enum: BuildingStatus,
    default: BuildingStatus.ACTIVE
  })
  status: BuildingStatus;

  @Column({ name: 'construction_year', type: 'int', nullable: true })
  constructionYear: number;

  @Column({ name: 'last_renovation', type: 'date', nullable: true })
  lastRenovation: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  facilities: string[];

  // Relations
  @OneToMany(() => Room, room => room.building)
  rooms: Room[];
}