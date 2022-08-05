import moment from 'moment';
import { ConversationTargetType } from './conversation';

/** 消息类型 */
export enum MessageType {
  /** 文本 */
  TEXT = 'text',
  /** 图片 */
  IMAGE = 'image',
  /** 图文混排 */
  RICH = 'rich',
  /** 声音 */
  AUDIO = 'audio',
  /** 视频 */
  VIDEO = 'video',
  /** 通知消息 */
  NOTIFY = 'notify',
}

/** 消息状态 */
export enum MessageStatus {
  SENDING = 'sending',
  SEND_SUCCESS = 'send_success',
  SEND_FAILED = 'send_failed',
}

/**
 * PersistFlag 是否需要存储到数据库
 */
export enum PersistFlag {
  PERSIST = 'persist',
  NO_PERSIST = 'no_persist',
}

/** 通知类消息的内容 type 类型  */
export enum MessageNotifyContentType {
  /** 添加好友请求 */
  ADD_FRIEND = 'add_friend',
}
/** 通知类消息的 content 类型 */
export interface MessageNotifyContent {
  type: MessageNotifyContentType;
  data: any;
}

export interface MessageDto {
  id: string;

  /**
   * 发送人 id
   */
  fromId: string;

  /**
   * 消息目标 id，若 targetType 是单聊，则为用户 id，群聊则为 群组id
   */
  targetId: string;

  /**
   * 目标类型，单聊 or 群聊
   */
  targetType: ConversationTargetType;

  /** 消息内容类型 */
  type: MessageType;

  /** 消息内容 string */
  content: string;

  /** 内容搜索关键词 */
  contentSearchable: string | null;

  /** 是否需要持久化到数据库 */
  persistFlag: PersistFlag;

  /** 消息状态 */
  status: MessageStatus;

  created?: string;

  updated?: string;
}

export class IMessage implements MessageDto {
  constructor(messageDto: MessageDto) {
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
      this.created = messageDto.created;
      this.updated = messageDto.updated;
    }
  }

  id: string;

  /**
   * 发送人 id
   */
  fromId: string;

  /**
   * 消息目标 id，若 targetType 是单聊，则为用户 id，群聊则为 群组id
   */
  targetId: string;

  /**
   * 目标类型，单聊 or 群聊
   */
  targetType: ConversationTargetType;

  /** 消息内容类型 */
  type: MessageType;

  /** 消息内容 string */
  content: string;

  /** 内容搜索关键词 */
  contentSearchable: string | null;

  /** 是否需要持久化到数据库 */
  persistFlag: PersistFlag;

  /** 消息状态 */
  status: MessageStatus;

  created?: string;

  updated?: string;

  get createdTimeFormatted() {
    return this.created ? moment(new Date(this.created)).format('HH:mm a') : '';
  }

  /**
   * 是否是通知类型消息
   * @returns {boolean}
   */
  isNotifyMessage() {
    return this.type === MessageType.NOTIFY;
  }

  /**
   * 获取通知的内容
   * @returns {MessageNotifyContent | null}
   */
  getNotifyMessageContent() {
    return this.isNotifyMessage()
      ? (JSON.parse(this.content) as MessageNotifyContent)
      : null;
  }
}
