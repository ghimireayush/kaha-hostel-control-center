import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Room } from './room.entity';
import { Amenity } from './amenity.entity';

@Entity('room_amenities')
@Index(['roomId', 'amenityId'], { unique: true })
@Index(['isActive'])
export class RoomAmenity extends BaseEntity {
  @Column({ name: 'room_id', length: 50 })
  roomId: string;

  @Column({ name: 'amenity_id' })
  amenityId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'installed_date', type: 'date', nullable: true })
  installedDate: Date;

  @Column({ name: 'last_serviced', type: 'date', nullable: true })
  lastServiced: Date;

  @Column({ type: 'text', nullable: true })
  condition: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => Room, room => room.amenities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => Amenity, amenity => amenity.roomAmenities)
  @JoinColumn({ name: 'amenity_id' })
  amenity: Amenity;
}