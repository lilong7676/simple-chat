/**
 * 获取用户离线消息缓存的key
 * @param userId 用户id
 * @returns cache key
 */
export function getOfflineMessageCacheKey(userId: string) {
  return `offline_message_${userId}`;
}
