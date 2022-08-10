import { IMessage } from './message';

/**
 * 会话目标类型
 */
export enum ConversationTargetType {
  /** 用户 */
  USER = 'user',
  /** 群组 */
  GROUP = 'group',
}

/**
 * 会话 dto
 */
export interface ConversationDto {
  id: string;
  userId: string;
  targetId: string;
  targetType: ConversationTargetType;
  created: string | undefined;
  updated: string | undefined;
}

/**
 * 会话类型，经由 ConversationDto 转化而来，
 * 方便前端使用
 */
export class IConversation {
  public id: string;

  public targetId: string;

  public targetType: ConversationTargetType;

  public created: string | undefined;

  public updated: string | undefined;

  /**
   * 该会话的最近一条消息
   */
  public lastMessage?: IMessage;

  /**
   * 最后已读的消息id
   */
  public lastReadMessageId?: string;

  /**
   * 未读消息数
   */
  public unreadCount: number;

  constructor(conv: ConversationDto) {
    this.id = conv.id;
    this.targetId = conv.targetId;
    this.targetType = conv.targetType;
    this.created = conv.created;
    this.updated = conv.created;
    this.unreadCount = 0;
  }
}
