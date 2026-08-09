import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Profile } from '../profile/profile.entity.js';

@Entity('journey_history')
export class JourneyHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  profileId!: string;

  @ManyToOne('Profile', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile!: Profile;

  @Column()
  dominantMode!: string;

  @Column({ type: 'float' })
  distanceMeters!: number;

  @Column({ type: 'int' })
  durationSeconds!: number;

  @Column({ type: 'int' })
  co2Grams!: number;

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
  departureAt!: Date;

  @Column({ type: 'timestamptz' })
  arrivalAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
