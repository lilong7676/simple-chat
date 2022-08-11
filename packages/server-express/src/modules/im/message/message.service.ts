/*
 * im message 相关
 * @Author: lilonglong
 * @Date: 2022-04-29 22:36:54
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-11 18:20:48
 */
import { AppDataSource } from '@app/data-source';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@lilong767676/common/lib/entity/im/Message';
import { ConversationTargetType } from '@lilong767676/common/lib/model/conversation';
import { ClientToServerResponse } from '@lilong767676/common/lib/types/io-socket';
import {
  MessageType,
  PersistFlag,
  MessageNotifyContent,
  MessageNotifyContentType,
  MessageDto,
} from '@lilong767676/common/lib/model/message';
import { MIo } from 'src/typings/socket';
import { getCacheManager } from '@app/cache-manager';
import { getOfflineMessageCacheKey } from './utils';

/** 消息表 */
const messageRepository = AppDataSource.getRepository(Message);

/** 系统用户id */
const SYSTEM_USER_ID = 'SYSTEM';

/** 发送超时时间 */
const SEND_TIMEOUT = 5000;

/**
 * 发送消息给某人
 * @param io io
 * @param targetUserId
 * @param message
 */
const sendMessageToUser = async (
  io: MIo,
  targetUserId: string,
  message: Message | Message[]
) => {
  const tempMessageList = (Array.isArray(message) ? message : [message]).map(
    message => Message.toDto(message)
  );

  io.to(targetUserId).emit('pushMessage', tempMessageList, result => {
    console.log('发送消息并接收成功', result);
  });
};

/**
 * 保存消息 并 发送消息
 * @param io socket.io
 * @param messageDto 消息dto
 * @returns {ClientToServerResponse | Error | undefined}
 */
export const saveAndSendMessage = async (
  io: MIo,
  messageDto: MessageDto
): Promise<ClientToServerResponse | Error | undefined> => {
  let message = new Message(messageDto);
  message = await saveMessage(message);

  return sendMessage(io, message);
};

/**
 * 直接发送消息
 * @param io
 * @param message
 * @returns
 */
export const sendMessage = async (
  io: MIo,
  message: Message
): Promise<ClientToServerResponse | Error | undefined> => {
  const { targetId } = message;

  const allSockets = await io.to(targetId).allSockets();

  console.log('allSockets', allSockets);
  if (Array.from(allSockets).length === 0) {
    // 用户未在线
    throw new Error('user not online');
  }

  return new Promise((resolve, reject) => {
    io.to(targetId)
      .timeout(SEND_TIMEOUT)
      .emit('pushMessage', message, errorOrResult => {
        console.log('server pushMessage result', errorOrResult);

        if (errorOrResult && errorOrResult instanceof Error) {
          reject(errorOrResult);
        } else {
          resolve(errorOrResult);
        }
      });
  });
};

/**
 * 保存消息到数据库
 * @param message 要保存的消息
 * @returns {Message}
 */
export const saveMessage = async (message: Message) => {
  // 不需要持久化，直接返回
  if (message.persistFlag === PersistFlag.NO_PERSIST) {
    return message;
  }
  // 持久化到数据库
  return messageRepository.save(message);
};

/**
 * 发送加好友请求消息
 */
export const sendRequestFriendMessage = async (
  io: MIo,
  fromId: string,
  toId: string
) => {
  const content: MessageNotifyContent = {
    type: MessageNotifyContentType.ADD_FRIEND,
    data: {
      fromId,
    },
  };

  const message = messageRepository.create({
    id: uuidv4(),
    fromId: SYSTEM_USER_ID,
    targetId: toId,
    targetType: ConversationTargetType.USER,
    persistFlag: PersistFlag.NO_PERSIST,
    type: MessageType.NOTIFY,
    content: JSON.stringify(content),
  });

  const finalMessage = await saveMessage(message);

  // 发送消息
  sendMessageToUser(io, toId, finalMessage);
};

/**
 * 消息发送失败（可能是用户未在线 or 发送超时）
 * 则将消息缓存起来，等用户上线 或者 服务器主动推送？client手动拉取？
 * @param message
 */
export const cacheOfflineMessage = async (message: Message) => {
  const cacheManager = getCacheManager();
  const { targetId } = message;
  const cacheKey = getOfflineMessageCacheKey(targetId);
  return cacheManager?.lPush(cacheKey, JSON.stringify(message));
};

/**
 * 获取离线消息
 * @param userId
 * @returns {Promise<Message[]>}
 */
export const getOfflineMessages = async (
  userId: string
): Promise<MessageDto[]> => {
  const cacheManager = getCacheManager();
  const offlineCacheKey = getOfflineMessageCacheKey(userId);
  let result: string[] = [];
  try {
    result = (await cacheManager?.getList(offlineCacheKey)) || [];
  } catch (error) {
    console.error(error);
  }
  return result.map(messageJSONStr => JSON.parse(messageJSONStr) as MessageDto);
};

export const deleteOfflineMessages = async (userId: string) => {
  const cacheManager = getCacheManager();
  const offlineCacheKey = getOfflineMessageCacheKey(userId);
  try {
    await cacheManager?.del(offlineCacheKey);
  } catch (error) {
    console.error(error);
  }
};
