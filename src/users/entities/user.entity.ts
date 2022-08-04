import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('increment')
  @Exclude()
  id: number;

  @Column({ type: 'varchar' })
  @Generated('uuid')
  @Index({ unique: true })
  externalId: string;

  @Column()
  @Index()
  name: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  @Index()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: string;

  @DeleteDateColumn({ type: 'timestamp with time zone' })
  deletedAt: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    const salt = await bcrypt.genSaltSync();

    if (!/^\$2a\$\d+\$/.test(this.password)) {
      this.password = bcrypt.hashSync(this.password, salt);
    }
  }
}
