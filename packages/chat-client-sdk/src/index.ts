import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import EventEmitter from 'eventemitter3';
import {
  LocalClientToServerEventsForClient,
  ServerToClientEvents,
  ServerToClientResponse,
} from '@lilong767676/common/lib/types/io-socket';
import {
  IMessage,
  MessageDto,
  MessageStatus,
  MessageType,
  PersistFlag,
} from '@lilong767676/common/lib/model/message';
import {
  IConversation,
  ConversationTargetType,
} from '@lilong767676/common/lib/model/conversation';
import ImDB from './db';

import { FetchHistoryMessagesOptions } from './typing';

export * from './typing';

// 发送消息到服务器的 超时时间
const SEND_TIMEOUT = 5000;

let sockerUrl;
if (
  process.env.NODE_ENV === 'production' &&
  !location.host.includes('localhost')
) {
  sockerUrl = 'http://119.91.47.174';
} else {
  sockerUrl = 'http://localhost:3000';
}

export interface ChatClientOptions {
  userId: string;
  accessToken: string;
}

/**
 * ChatClient的 emit 事件类型定义
 */
export interface ChatClientEventTypes {
  /** 发送消息中 */
  sendingMessage: (message: IMessage) => void;
  /** 接收到消息 */
  receiveMessage: (messageList: IMessage[]) => void;
  /** 接收到通知类消息 */
  receiveNotifyMessage: (messageList: IMessage[]) => void;
  /** 刷新会话列表 */
  refreshConversationList: (convList: IConversation[]) => void;
}

/** socket 管理器 */
export class ChatClient extends EventEmitter<ChatClientEventTypes> {
  /** 单例 */
  static manager: ChatClient | undefined;

  private options: ChatClientOptions;

  /** io socket */
  private socket:
    | Socket<ServerToClientEvents, LocalClientToServerEventsForClient>
    | undefined;

  private db: ImDB;

  constructor(options: ChatClientOptions) {
    super();
    if (ChatClient.manager) {
      // 获取单例
      // eslint-disable-next-line no-constructor-return
      return ChatClient.manager;
    }
    this.options = options;
    const { accessToken, userId } = options;

    /** 初始化本地数据库 */
    this.db = new ImDB(userId);

    /** 初始化 socket 连接服务器 */
    const socket: Socket<
      ServerToClientEvents,
      LocalClientToServerEventsForClient
    > = io(sockerUrl, {
      auth: {
        token: accessToken,
      },
    });
    this.socket = socket;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    ChatClient.manager = this;

    /** socket 事件处理 */
    socket.on('connect', () => {
      console.log('socket connected', socket.id);
      // 主动拉取离线消息
      this.fetchOfflineMessages();
    });

    socket.on('connect_error', e => {
      console.log('socket connect_error', e);
    });

    socket.on('disconnect', (reason, desc) => {
      console.log('socket disconnect', reason, desc);
    });

    /**
     * 处理服务器推送消息
     */
    socket.on('pushMessage', (message: MessageDto | MessageDto[], cb) => {
      cb({ ok: 1 });
      console.log('收到服务器推送消息', message);
      const messageListTemp = Array.isArray(message) ? message : [message];
      this.handleReceivedMessages(messageListTemp);
    });
  }

  /**
   * 登出逻辑
   */
  public onLogout() {}

  /**
   * 发送消息
   * @param message {MessageDto}
   */
  private async sendMessage(
    message: MessageDto
  ): Promise<ServerToClientResponse | Error> {
    // 存储到本地数据库
    message = await this.db.prepareMessage(message);

    // emit 发送消息事件
    this.emit('sendingMessage', new IMessage(message));

    return new Promise((resolve, reject) => {
      this.socket
        ?.timeout(SEND_TIMEOUT)
        .emit('messageFromClient', message, (error, result) => {
          console.log('发送消息结果', error, result);
          if (error) {
            // timeout error
            reject(error);
          } else {
            resolve(result);
          }
        });
    });
  }

  private async fetchOfflineMessages(): Promise<MessageDto[]> {
    return new Promise((resolve, reject) => {
      this.socket
        ?.timeout(SEND_TIMEOUT)
        .emit('fetchOfflineMessages', undefined, (error, resp) => {
          console.log('fetchOfflineMessages', error, resp);
          if (error) {
            reject(error);
          } else {
            const offlineMessages = resp.result ? resp.result : [];
            this.handleReceivedMessages(offlineMessages);
            resolve(offlineMessages);
          }
        });
    });
  }

  private async handleReceivedMessages(messages: MessageDto[]) {
    // 保存消息到数据库
    this.db.handleReceivedMessage(messages);

    // emit 收到消息事件
    const messageList: IMessage[] = messages.map(msg => new IMessage(msg));
    this.emit('receiveMessage', messageList);

    setTimeout(() => {
      const notifyMessageList = messageList.filter(message => {
        return message.isNotifyMessage;
      });
      // 收到通知类消息
      if (notifyMessageList.length > 0) {
        this.emit('receiveNotifyMessage', notifyMessageList);
      }
      // 刷新会话列表
      this.refreshConversationList();
    }, 0);
  }

  private async refreshConversationList() {
    const list = await this.fetchConversations();
    this.emit('refreshConversationList', list);
  }

  /**
   * 向某人发送文本消息
   */
  public async sendTextMessage(targetId: string, content: string) {
    const { userId } = this.options;
    const message: MessageDto = {
      id: uuidv4(),
      fromId: userId,
      targetId,
      targetType: ConversationTargetType.USER,
      type: MessageType.TEXT,
      content,
      contentSearchable: '文字',
      persistFlag: PersistFlag.PERSIST,
      status: MessageStatus.SENDING,
    };
    try {
      return await this.sendMessage(message);
    } catch (error) {
      console.error('sendTextMessage', error);
      return { ok: 0, message: (error as Error).message };
    }
  }

  /**
   * 获取本地数据库历史消息列表
   * @param options FetchHistoryMessagesOptions
   * @returns {IMessage[]}
   */
  public async fetchHistoryMessages(options: FetchHistoryMessagesOptions) {
    const { targetId } = options;
    if (!targetId) {
      throw new Error('no targetId');
    }
    return this.db.fetchHistoryMessages(options);
  }

  /**
   * 获取会话列表
   */
  private async fetchConversations(): Promise<IConversation[]> {
    return new Promise(resolve => {
      this.socket
        ?.timeout(SEND_TIMEOUT)
        .emit('fetchConversations', undefined, (error, resp) => {
          console.log('fetchConversations', error, resp);

          this.db.fetchHistoryConversations().then(lastConversationList => {
            if (error) {
              console.error(error);
              // 返回缓存的会话列表
              resolve(lastConversationList);
            } else {
              const conversationDtoList = resp.result ? resp.result : [];
              Promise.all(
                conversationDtoList.map(async convDto => {
                  let lastReadMessageId;

                  if (lastConversationList.length) {
                    const lastConversation = lastConversationList.find(
                      conv => conv.id === convDto.id
                    );
                    lastReadMessageId = lastConversation?.lastReadMessageId;
                  }

                  const params = {
                    targetId: convDto.targetId,
                    // 性能考虑，最多加载100条消息
                    pageSize: 100,
                    from: lastReadMessageId,
                  };

                  const historyMessages = await this.db.fetchHistoryMessages(
                    params
                  );

                  const conversation = new IConversation(convDto);
                  if (historyMessages.length) {
                    // 会话的最新一条消息
                    conversation.lastMessage =
                      historyMessages[historyMessages.length - 1];

                    conversation.lastReadMessageId = lastReadMessageId;

                    // 计算unreadCount
                    if (lastReadMessageId !== conversation.lastMessage?.id) {
                      conversation.unreadCount = lastReadMessageId
                        ? historyMessages.length - 1
                        : historyMessages.length;
                    }
                  }
                  return conversation;
                })
              )
                .then(conversationList => {
                  this.db.saveConversations(conversationList).then(() => {
                    resolve(conversationList);
                  });
                })
                .catch(e => {
                  console.error(e);
                  resolve(lastConversationList);
                });
            }
          });
        });
    });
  }

  /**
   * 标记会话为已读
   */
  public markConversationRead(targetId, lastReadMessageId?: string) {
    this.db.fetchHistoryConversations().then(lastConversationList => {
      const lastConv = lastConversationList.find(
        one => one.targetId === targetId
      );
      if (lastConv) {
        lastConv.lastReadMessageId =
          lastReadMessageId || lastConv.lastMessage?.id;
        lastConv.unreadCount = 0;
        this.db.saveConversations(lastConversationList).then(() => {
          this.refreshConversationList();
        });
      }
    });
  }

  public destroy() {
    this.socket?.disconnect();
    this.socket = undefined;
    this.db?.close();
    ChatClient.manager = undefined;
    console.log('ChatClient destroied');
  }
}

/**
 * 获取 ChatClient 单例
 */
export const getChatClient = () => {
  if (ChatClient.manager) {
    return ChatClient.manager;
  }
  throw new Error('ChatClient 还未初始化!');
};

/** 初始化 ChatClient 单例 */
export const initChatClient = (options: ChatClientOptions) => {
  if (ChatClient.manager) {
    return ChatClient.manager;
  }
  return new ChatClient(options);
};

export const destroyChatClient = () => {};
