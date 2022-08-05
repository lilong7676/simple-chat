/*
 *  群成员表
 * @Author: lilonglong
 * @Date: 2022-04-26 22:51:59
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-04-26 17:02:19
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 群 id
   */
  @Column()
  groupId: number;

  /**
   * 群成员 id
   */
  @Column()
  memberId: string;

  /**
   * 群成员昵称
   */
  @Column({ nullable: true })
  alias: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
