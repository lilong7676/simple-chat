import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Friend } from './im/Friend';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 用户名需唯一 */
  @Column({ type: 'varchar', length: 15, unique: true })
  name: string;

  /** email 如果有的话，也唯一 */
  @Column({ length: 50 })
  email: string;

  /** 手机号码如果有的话，也唯一 */
  @Column({ type: 'varchar', length: 15 })
  phone: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Friend, friend => friend.friend)
  friends: Friend[];

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @DeleteDateColumn()
  deleted: Date;
}
