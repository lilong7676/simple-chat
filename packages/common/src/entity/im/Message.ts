/* eslint-disable max-classes-per-file */
/*
 * 消息表
 * @Author: lilonglong
 * @Date: 2022-04-26 22:36:21
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-07-18 14:53:31
 */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConversationTargetType } from '../../model/conversation';
import {
  MessageType,
  MessageStatus,
  PersistFlag,
  MessageDto,
} from '../../model/message';

/**
 * message 数据库实体
 */
@Entity()
export class Message {
  constructor(messageDto?: MessageDto) {
    if (messageDto) {
      this.id = messageDto.id;
      this.fromId = messageDto.fromId;
      this.targetId = messageDto.targetId;
      this.targetType = messageDto.targetType;
      this.type = messageDto.type;
      this.content = messageDto.content;
      this.contentSearchable = messageDto.contentSearchable || '';
      this.persistFlag = messageDto.persistFlag;
      this.status = messageDto.status;
    }
  }

  static fromJSONObj(messageJson: object) {
    const message = new Message();
    Object.keys(messageJson).forEach(key => {
      message[key] = messageJson[key];
    });
    return message;
  }

  static toDto(message: Message): MessageDto {
    const messageDto: MessageDto = {
      id: message.id,
      fromId: message.fromId,
      targetId: message.targetId,
      targetType: message.targetType,
      type: message.type,
      content: message.content,
      contentSearchable: message.contentSearchable,
      persistFlag: message.persistFlag,
      status: message.status,
      created: String(message.created ? message.created : ''),
      updated: String(message.updated ? message.updated : ''),
    };
    return messageDto;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 发送人 id
   */
  @Column()
  fromId: string;

  /**
   * 消息目标 id，若 targetType 是单聊，则为用户 id，群聊则为 群组id
   */
  targetId: string;

  /**
   * 目标类型，单聊 or 群聊
   */
  @Column({
    type: 'enum',
    enum: ConversationTargetType,
    default: ConversationTargetType.USER,
  })
  targetType: ConversationTargetType;

  /** 消息内容类型 */
  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  /** 消息内容 string */
  @Column()
  content: string;

  /** 内容搜索关键词 */
  @Column({ nullable: true })
  contentSearchable: string;

  /** 是否需要持久化到数据库 */
  @Column({
    type: 'enum',
    enum: PersistFlag,
    default: PersistFlag.PERSIST,
  })
  persistFlag: PersistFlag;

  /** 消息状态 */
  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENDING,
  })
  status: MessageStatus;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
