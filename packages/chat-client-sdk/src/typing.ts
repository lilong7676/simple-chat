/**
 * 拉取消息，若本地有消息，则优先从本地拉取，否则从服务器拉取
 */
export interface FetchHistoryMessagesOptions {
  /** 目标用户id */
  targetId: string;
  /** 默认 20 */
  pageSize?: number;
  /** 消息id，从哪个消息开始拉取，默认从最新消息拉取 */
  before?: string;
  /** 消息id，从哪个消息开始拉取，默认从最新消息拉取 */
  from?: string;
}
