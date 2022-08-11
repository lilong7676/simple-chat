/*
 * 消息本地数据库
 * @Author: lilonglong
 * @Date: 2022-06-15 22:35:07
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-11 18:21:09
 */
import Dexie from 'dexie';
import {
  MessageDto,
  IMessage,
  PersistFlag,
} from '@lilong767676/common/lib/model/message';
import {
  IConversation,
  ConversationTargetType,
} from '@lilong767676/common/lib/model/conversation';
import { FetchHistoryMessagesOptions } from '../typing';

export default class ImDB extends Dexie {
  /**
   * 消息表
   */
  t_message!: Dexie.Table<IMessage, string>;

  /**
   * 会话表
   */
  t_conversation!: Dexie.Table<IConversation, string>;

  constructor(userId: string) {
    super(userId);
    //
    // Define tables and indexes
    // (Here's where the implicit table props are dynamically created)
    //
    this.version(1).stores({
      t_message: '&id, fromId, targetId, targetType, status',
      t_conversation: '&id, targetId, targetType',
    });

    this.t_message.mapToClass(IMessage);
    this.t_conversation.mapToClass(IConversation);
  }

  /**
   * 处理服务器推送的消息
   * @param message
   */
  public handleReceivedMessage(message: MessageDto | MessageDto[]) {
    const messageList = Array.isArray(message) ? message : [message];

    // 过滤出需要保存的消息
    const messagesToSave = messageList.filter(
      message => message.persistFlag === PersistFlag.PERSIST
    );

    if (messagesToSave.length) {
      // 保存消息到 db
      this.transaction('rw', this.t_message, () => {
        return Promise.all(
          messagesToSave.map(message =>
            this.t_message.put(new IMessage(message))
          )
        );
      })
        .then(results => {
          console.log('results', results);
        })
        .catch(e => {
          console.error('存储消息出错', e);
        });
    }
  }

  /**
   * 消息发送前的处理
   * @param message 要处理的消息
   * @returns message 处理后的message
   */
  public async prepareMessage(message: MessageDto) {
    if (message.persistFlag === PersistFlag.PERSIST) {
      try {
        await this.transaction('rw', this.t_message, () => {
          const nowTime = new Date().toISOString();
          const tempMessage = {
            ...message,
          };
          if (!tempMessage.created) {
            // 如果没有 创建时间，则补上创建时间，不影响服务器数据库上的创建时间
            // 确保保存到本地的时候，有创建时间
            tempMessage.created = nowTime;
            tempMessage.updated = nowTime;
          }
          return this.t_message.put(new IMessage(tempMessage));
        });
      } catch (error) {
        console.error('prepareMessage', error);
      }
    }
    return message;
  }

  public async fetchHistoryMessages(options: FetchHistoryMessagesOptions) {
    const { targetId, pageSize = 20, from, before } = options;
    console.log('fetchHistoryMessages options', options);
    const messages = await this.transaction('rw', this.t_message, async () => {
      // Transaction block
      let result: IMessage[] = [];
      const collection = await this.t_message
        .where('targetType')
        .equals(ConversationTargetType.USER)
        .filter(message => {
          return message.fromId === targetId || message.targetId === targetId;
        });

      const targetMsgId = from || before;
      const loadDirection = from ? 'from' : 'before';

      if (targetMsgId) {
        const targetMessage = await this.t_message
          .where('id')
          .equals(targetMsgId)
          .first();

        if (targetMessage) {
          result = await collection
            .and(message => {
              if (loadDirection === 'from') {
                // 查找比 fromMessage 更晚的消息
                return (
                  new Date(message.created || '').getTime() >=
                  new Date(targetMessage.created || '').getTime()
                );
              }
              // 查找比 beforeMessage 更早的消息
              return (
                new Date(message.created || '').getTime() <=
                new Date(targetMessage.created || '').getTime()
              );
            })
            .sortBy('created', arr => {
              return arr.sort((aMessage, bMessage) => {
                if (aMessage.created && bMessage.created) {
                  return (
                    new Date(aMessage.created).getTime() -
                    new Date(bMessage.created).getTime()
                  );
                }
                return 1;
              });
            });
        }
      } else {
        result = await collection.sortBy('created', arr => {
          return arr.sort((aMessage, bMessage) => {
            if (aMessage.created && bMessage.created) {
              return (
                new Date(aMessage.created).getTime() -
                new Date(bMessage.created).getTime()
              );
            }
            return 1;
          });
        });
      }
      // 分页
      result = result.slice(-pageSize);

      return result;
    });
    return messages;
  }

  /**
   * 保存会话列表到数据库
   * @param conversationList IConversation[]
   */
  public async saveConversations(
    conversationList: IConversation[]
  ): Promise<boolean> {
    try {
      await this.transaction('rw', this.t_conversation, () => {
        return Promise.all(
          conversationList.map(conv => this.t_conversation.put(conv))
        );
      });
      return true;
    } catch (error) {
      console.error('db saveConversations error:', error);
    }
    return false;
  }

  /**
   * 拉取历史会话列表
   * @returns {IConversation[]}
   */
  public async fetchHistoryConversations(): Promise<IConversation[]> {
    try {
      const result = await this.t_conversation.toArray();
      console.log('db fetchHistoryConversations result:', result);
      return result;
    } catch (error) {
      return [];
    }
  }
}
