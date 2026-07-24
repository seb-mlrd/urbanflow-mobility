import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Profile } from '../../profile/profile.entity.js';
import type { DisruptionAlert } from './disruption-alert.entity.js';

@Entity('user_notifications')
export class UserNotification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  profileId!: string;

  @ManyToOne('Profile', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile!: Profile;

  @Column()
  alertId!: string;

  @ManyToOne('DisruptionAlert', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'alertId' })
  alert!: DisruptionAlert;

  @Column({ default: false })
  read!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  alternativeItinerary!: unknown;

  @CreateDateColumn()
  createdAt!: Date;
}
