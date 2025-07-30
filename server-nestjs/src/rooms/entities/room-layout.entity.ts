import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Room } from './room.entity';

@Entity('room_layouts')
@Index(['roomId'])
@Index(['isActive'])
export class RoomLayout extends BaseEntity {
  @Column({ name: 'room_id', length: 50 })
  roomId: string;

  @Column({ length: 100 })
  name: string; // Layout name/version

  @Column({ type: 'jsonb' })
  layoutData: Record<string, any>; // Complex layout information

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: {
    length: number;
    width: number;
    height: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  theme: {
    name: string;
    wallColor: string;
    floorColor: string;
  };

  // Relations
  @ManyToOne(() => Room, room => room.layouts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;
}