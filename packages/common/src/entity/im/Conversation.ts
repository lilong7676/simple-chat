/* eslint-disable max-classes-per-file */
/*
 * 会话表
 * @Author: lilonglong
 * @Date: 2022-04-26 22:36:33
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-07-18 14:56:26
 */
import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ConversationDto,
  ConversationTargetType,
} from '../../model/conversation';

/**
 * 会话数据库实体
 */
@Entity()
export class Conversation {
  static toDto(conversation: Conversation): ConversationDto {
    const dto: ConversationDto = {
      id: conversation.id,
      userId: conversation.userId,
      targetId: conversation.targetId,
      targetType: conversation.targetType,
      created: String(conversation.created),
      updated: String(conversation.updated),
    };
    return dto;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 会话所属用户id
   */
  @PrimaryColumn()
  userId: string;

  /**
   * 会话的目标id
   */
  @PrimaryColumn()
  targetId: string;

  /**
   * 会话目标类型
   */
  @Column({
    type: 'enum',
    enum: ConversationTargetType,
    default: ConversationTargetType.USER,
  })
  targetType: ConversationTargetType;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
