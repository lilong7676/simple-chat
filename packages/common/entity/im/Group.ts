/*
 * 群组表
 * @Author: lilonglong
 * @Date: 2022-04-26 22:40:29
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-04-26 17:02:26
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 群名称
   */
  @Column()
  name: string;

  /**
   * 拥有者id
   */
  @Column()
  ownerId: string;

  /**
   * 群头像
   */
  @Column()
  portrait: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
