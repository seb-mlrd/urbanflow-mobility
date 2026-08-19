import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Profile } from '../profile/profile.entity.js';

@Entity('planned_itineraries')
export class PlannedItinerary {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  profileId!: string;

  @ManyToOne('Profile', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile!: Profile;

  @Column()
  fromLabel!: string;

  @Column()
  toLabel!: string;

  @Column({ type: 'float' })
  fromLat!: number;

  @Column({ type: 'float' })
  fromLng!: number;

  @Column({ type: 'float' })
  toLat!: number;

  @Column({ type: 'float' })
  toLng!: number;

  @Column({ type: 'timestamptz' })
  plannedAt!: Date;

  @Column({ type: 'text', array: true, default: '{}' })
  selectedModes!: string[];

  @CreateDateColumn()
  createdAt!: Date;
}
