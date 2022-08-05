/*
 * 会话相关
 * @Author: lilonglong
 * @Date: 2022-07-04 22:12:13
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-07-19 17:51:26
 */

import { AppDataSource } from 'src/app/data-source';
import { Conversation } from '@toys/common/entity/im/Conversation';
import {
  ConversationTargetType,
  ConversationDto,
} from '@toys/common/model/conversation';

/** 数据库表 */
const conversationRepository = AppDataSource.getRepository(Conversation);

/**
 * 创建新会话
 * @param userId 用户id
 * @param targetId 会话目标id
 * @param targetType 会话类型
 * @returns {Conversation}
 */
export const createConversation = async (
  userId: string,
  targetId: string,
  targetType: ConversationTargetType
) => {
  // 先判断是否已存在此会话
  const [result, count] = await conversationRepository.findAndCount({
    where: {
      userId,
      targetId,
      targetType,
    },
  });
  // 已存在则直接返回此会话
  if (count > 0) {
    return result[0];
  }

  // 创建会话
  const conversation = new Conversation();
  conversation.userId = userId;
  conversation.targetId = targetId;
  conversation.targetType = targetType;

  const conversation2 = new Conversation();
  conversation2.userId = targetId;
  conversation2.targetId = userId;
  conversation2.targetType = targetType;

  return await conversationRepository.save([conversation, conversation2]);
};

/**
 * 获取指定用户的聊天会话列表
 * @param userId 指定用户
 * @returns {ConversationDto[]}
 */
export const getConversationList = async (
  userId: string
): Promise<ConversationDto[]> => {
  const conversationList = await conversationRepository.find({
    where: {
      userId,
    },
  });
  return conversationList.map(conv => Conversation.toDto(conv));
};
