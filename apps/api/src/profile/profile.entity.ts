import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TRANSPORT_MODES } from '@urbanflow/shared';
import type { User } from '../users/user.entity.js';

@Entity('profiles')
export class Profile {
  static readonly TRANSPORT_MODES = TRANSPORT_MODES;

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;

  @Column('simple-array', { default: '' })
  transportModes!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
