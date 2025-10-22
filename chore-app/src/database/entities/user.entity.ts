import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Kids } from './kids.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 72 })
  password: string;

  @Column({ type: 'enum', enum: ['parent', 'child', 'admin', 'user'], default: 'parent' })
  userType: 'parent' | 'child' | 'admin' | 'user';

  @Column({ length: 50, nullable: true, default: '' })
  firstName: string;

  @Column({ length: 50, nullable: true, default: '' })
  lastName: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // One parent user can have many kids (only if userType is 'parent')
  @OneToMany(() => Kids, (kid) => kid.parent)
  kids: Kids[];
}

