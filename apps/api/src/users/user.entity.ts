import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Profile } from '../profile/profile.entity.js';

export type UserRole = 'user' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })
  role!: UserRole;

  @OneToOne('Profile', (profile: Profile) => profile.user)
  profile!: Profile;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
