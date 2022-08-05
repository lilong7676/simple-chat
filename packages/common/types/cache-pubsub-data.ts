import { Friend } from '../entity/im/Friend';

/**
 * 发布订阅 channel
 */
export enum PubSubChannel {
  onRequestAddFriend = 'onRequestAddFriend',
  onUpdateFriendRequestStatus = 'onUpdateFriendRequestStatus',
}

/**
 * 请求加好友请求
 */
export type PubSubRequestFriendData = Pick<Friend, 'userId' | 'friendId'>;

/**
 * 更新好友请求状态
 */
export type PubSubUpdateFriendRequestStatusData = Pick<
  Friend,
  'userId' | 'friendId' | 'reqStatus'
>;
