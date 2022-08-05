/*
 * 好友表
 * @Author: lilonglong
 * @Date: 2022-04-26 22:39:55
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-06-15 17:52:18
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../User';
import { UserDto } from '../../model/user';

export enum FriendReqStatus {
  /** 请求加好友 */
  PENDING = 'pending',
  /** 已拒绝此好友 */
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
}

@Entity()
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 用户id
   */
  @Column()
  userId: string;

  /**
   * 好友id
   */
  @Column()
  friendId: string;

  @ManyToOne(() => User, user => user.friends)
  user: User;

  @ManyToOne(() => User, user => user.friends)
  friend: User;

  @Column({
    type: 'enum',
    enum: FriendReqStatus,
    default: FriendReqStatus.PENDING,
  })
  reqStatus: FriendReqStatus;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}

/**
 * 好友关系item
 */
export interface FriendRelationItem {
  id: string;
  userId: string;
  friendId: string;
  friend: UserDto | null;
  user: UserDto | null;
  reqStatus: FriendReqStatus;
  created: string;
  updated: string;
}
