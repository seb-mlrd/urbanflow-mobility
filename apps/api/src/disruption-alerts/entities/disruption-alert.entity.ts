import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('disruption_alerts')
export class DisruptionAlert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  gtfsAlertId!: string;

  @Column()
  routeGtfsId!: string;

  @Column()
  routeShortName!: string;

  @Column()
  headerText!: string;

  @Column({ type: 'text', nullable: true })
  descriptionText!: string | null;

  @Column()
  severity!: string;

  @Column({ type: 'timestamptz', nullable: true })
  effectiveStart!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  effectiveEnd!: Date | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
