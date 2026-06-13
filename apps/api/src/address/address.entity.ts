import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Profile } from '../profile/profile.entity.js';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 50 })
  name!: string;

  @Column()
  label!: string;

  @Column({ type: 'float' })
  lat!: number;

  @Column({ type: 'float' })
  lng!: number;

  @Column()
  profileId!: string;

  @ManyToOne('Profile', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile!: Profile;

  @CreateDateColumn()
  createdAt!: Date;
}
