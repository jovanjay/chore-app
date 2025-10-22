import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Kids } from './kids.entity';
import { User } from './user.entity';

export enum ChoreStatus {
  CREATED = 'created',       // Initial state - parent created the chore
  STARTED = 'started',       // Kid started working on the chore
  FINISHED = 'finished',     // Kid finished and submitted for approval
  APPROVED = 'approved',     // Parent approved the chore
  REDO = 'redo',            // Parent asked kid to redo
  REJECTED = 'rejected',     // Parent rejected the chore
}

@Entity()
export class Chore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'datetime', nullable: true })
  dateStarted: Date;

  @Column({ type: 'enum', enum: ChoreStatus, default: ChoreStatus.CREATED })
  status: ChoreStatus;

  @Column({ type: 'text', nullable: true })
  photo: string; // URL or path to the photo proof

  @Column({ type: 'int', default: 0 })
  points: number; // Points awarded for completing this chore

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Many-to-many: A chore can be assigned to multiple kids
  @ManyToMany(() => Kids, (kid) => kid.chores, { cascade: true })
  @JoinTable({
    name: 'chore_assignments',
    joinColumn: { name: 'choreId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'kidId', referencedColumnName: 'id' },
  })
  assignedKids: Kids[];

  // Created by a parent
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: User;

  @Column({ type: 'uuid' })
  parentId: string;
}

