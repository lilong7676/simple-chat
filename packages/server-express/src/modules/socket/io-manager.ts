/*
 * IoManager
 * @Author: lilonglong
 * @Date: 2022-04-28 22:17:42
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-11 18:20:48
 */
import {
  PubSubRequestFriendData,
  PubSubUpdateFriendRequestStatusData,
} from '@lilong767676/common/lib/types/cache-pubsub-data';
import { Message } from '@lilong767676/common/lib/entity/im/Message';
import { MessageDto } from '@lilong767676/common/lib/model/message';
import { PubSubChannel } from '@lilong767676/common/lib/types/cache-pubsub-data';
import { ConversationTargetType } from '@lilong767676/common/lib/model/conversation';
import { getCacheManager } from '@app/cache-manager';
import * as messageService from '@modules/im/message/message.service';
import * as conversationService from '@modules/im/conversation/conversation.service';
import { MIo, MSocket } from 'src/typings/socket';
export class IoManager {
  static manager: IoManager;

  private io: MIo;

  private get cacheManager() {
    return getCacheManager();
  }

  constructor(io: MIo) {
    if (IoManager.manager) {
      return IoManager.manager;
    }
    this.io = io;
    this.initCacheSubscribeListener();
    IoManager.manager = this;
  }

  /**
   * 设置 socket 监听事件
   * @param socket
   */
  public setupSocketOn(socket: MSocket) {
    // disconnect 事件
    socket.on('disconnect', reason => {
      console.log('disconnect', socket.id, reason);
      if (!socket.data.userId) return;

      // leave room
      socket.leave(socket.data.userId);

      // 移除 cache 的 socketId
      this.cacheManager?.lRemove(socket.data.userId, 0, socket.id);
    });

    // 响应 client 端发送消息给某人
    socket.on('messageFromClient', (message, callback) => {
      console.log('messageFromClient', message);
      const { targetId } = message;
      if (!targetId) {
        callback({ ok: 0, message: 'no targetId' });
      } else {
        this.sendMessage(message);
        callback({ ok: 1 });
      }
    });

    // 响应 client 端获取离线消息
    socket.on('fetchOfflineMessages', async (_data, callback) => {
      const userId = socket.data.userId;
      console.log('fetchOfflineMessages', userId);
      if (!userId) {
        return;
      }
      try {
        const offlineMessages = await messageService.getOfflineMessages(userId);
        callback({
          ok: 1,
          message: 'ok',
          result: offlineMessages,
        });
        //FIXME 这里可能会有bug,如果 client 没有收到离线消息怎么办？
        // 删除离线消息
        if (offlineMessages.length) {
          await messageService.deleteOfflineMessages(userId);
        }
      } catch (error) {
        callback({
          ok: 0,
          message: 'fetchOfflineMessages error',
        });
      }
    });

    // 响应 client 端获取会话列表
    socket.on('fetchConversations', async (_data, callback) => {
      const userId = socket.data.userId;
      console.log('fetchConversations', userId);
      if (!userId) {
        return;
      }
      try {
        const conversationList = await conversationService.getConversationList(
          userId
        );
        callback({
          ok: 1,
          message: 'ok',
          result: conversationList,
        });
      } catch (error) {
        callback({
          ok: 0,
          message: 'fetchConversations error',
        });
      }
    });
  }

  /**
   * 用户登陆成功
   * @param socket
   */
  public async handleUserLogined(socket: MSocket) {
    const userId = socket.data.userId;
    if (!userId) return;

    // join userId， 方便根据 userId 获取 socket
    socket.join(userId);

    // 缓存 userId 对应的 socket.id 列表
    await this.cacheManager?.lPush(userId, socket.id);

    // 查询是否已有未处理的好友请求消息
    this.checkUserFriendRequests(socket);

    // 查询并推送会话列表

    // 查询并推送离线消息
  }

  /**
   * 初始化 cache 监听者
   */
  initCacheSubscribeListener() {
    // 监听加好友请求
    this.cacheManager?.subscribe(PubSubChannel.onRequestAddFriend, message => {
      const data = JSON.parse(message) as PubSubRequestFriendData;
      this.handleRequestAddFriend(data);
    });

    // 监听修改好友请求状态
    this.cacheManager?.subscribe(
      PubSubChannel.onUpdateFriendRequestStatus,
      message => {
        const data = JSON.parse(message) as PubSubUpdateFriendRequestStatusData;
        this.handleOnUpdateFriendRequestStatus(data);
      }
    );
  }

  /**
   * 加好友请求
   * @param data PubSubRequestFriendData
   */
  private handleRequestAddFriend(data: PubSubRequestFriendData) {
    const { userId, friendId } = data;
    // 发送加好友请求消息
    messageService.sendRequestFriendMessage(this.io, userId, friendId);
  }

  /**
   * 修改好友请求状态
   * @param data PubSubUpdateFriendRequestStatusData
   */
  private handleOnUpdateFriendRequestStatus(
    data: PubSubUpdateFriendRequestStatusData
  ) {
    console.log('handleOnUpdateFriendRequestStatus', data);
    //TODO
  }

  /**
   * 发送消息给 client
   * @param message MessageDto
   * @returns {ClientToServerResponse | Error | undefined}
   */
  public async sendMessage(messageDto: MessageDto) {
    // 暂时只支持单聊哦
    // FIXME 优化性能，没必要每次都查询一下数据库
    if (messageDto.targetType === ConversationTargetType.USER) {
      await conversationService.createConversation(
        messageDto.fromId,
        messageDto.targetId,
        messageDto.targetType
      );
    }

    let message = new Message(messageDto);
    try {
      message = await messageService.saveMessage(message);
      await messageService.sendMessage(this.io, message);
    } catch (error) {
      console.log('发送消息 error', error);
      await messageService.cacheOfflineMessage(message);
    }
  }

  /**
   * 检查用户好友请求信息
   */
  private async checkUserFriendRequests(socket: MSocket) {
    const userId = socket.data.userId || '';
    // this.cacheManager?.get()
  }
}
