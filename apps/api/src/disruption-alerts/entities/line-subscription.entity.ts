import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Profile } from '../../profile/profile.entity.js';

@Entity('line_subscriptions')
export class LineSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  profileId!: string;

  @ManyToOne('Profile', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile!: Profile;

  @Column()
  routeGtfsId!: string;

  @Column()
  routeShortName!: string;

  @Column({ type: 'varchar', nullable: true })
  fromLabel!: string | null;

  @Column({ type: 'float', nullable: true })
  fromLat!: number | null;

  @Column({ type: 'float', nullable: true })
  fromLng!: number | null;

  @Column({ type: 'varchar', nullable: true })
  toLabel!: string | null;

  @Column({ type: 'float', nullable: true })
  toLat!: number | null;

  @Column({ type: 'float', nullable: true })
  toLng!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
