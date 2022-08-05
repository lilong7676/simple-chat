/*
 * 前后端 api 参数类型统一
 * @Author: lilonglong
 * @Date: 2022-06-16 22:11:26
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-06-16 15:24:36
 */

/**
 * 同意/拒绝 加好友请求
 */
export interface UpdateIncomingFriendRequestParams {
  friendId: string;
  accept: boolean;
}
