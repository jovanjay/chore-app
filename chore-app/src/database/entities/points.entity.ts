import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Kids } from './kids.entity';
import { Chore } from './chore.entity';
import { Reward } from './reward.entity';

export enum PointStatus {
  CLAIMABLE = 'claimable',   // Points earned but not yet claimed
  CLAIMED = 'claimed',        // Points have been claimed/spent
}

@Entity()
export class Points {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  amount: number; // Number of points

  @Column({ type: 'enum', enum: PointStatus, default: PointStatus.CLAIMABLE })
  status: PointStatus;

  @Column({ type: 'text', nullable: true })
  description: string; // Description of how points were earned

  @Column({ type: 'datetime', nullable: true })
  claimedAt: Date; // When points were claimed

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  earnedAt: Date; // When points were earned

  // Points belong to a kid
  @ManyToOne(() => Kids, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kidId' })
  kid: Kids;

  @Column({ type: 'uuid' })
  kidId: string;

  // Points earned from a chore (optional - points could be awarded other ways)
  @ManyToOne(() => Chore, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'choreId' })
  chore: Chore;

  @Column({ type: 'uuid', nullable: true })
  choreId: string;

  // Reward redeemed with these points (optional - only if points were used for a reward)
  @ManyToOne(() => Reward, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'rewardId' })
  reward: Reward;

  @Column({ type: 'uuid', nullable: true })
  rewardId: string;
}

