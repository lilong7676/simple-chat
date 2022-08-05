/*
 * CacheManager
 * {https://github.com/redis/node-redis#rediscreateclient}
 * @Author: lilonglong
 * @Date: 2022-04-27 22:18:36
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-07-18 11:40:13
 */
import { createClient } from 'redis';
import { PubSubChannel } from '@toys/common/types/cache-pubsub-data';
import logger from 'src/common/utils/logger';

/**
 * 发布订阅监听函数
 */
type SubListener = (message: string) => void;

/** cacheManager 单例 */
let cacheManager: CacheManager | undefined;

/** CacheManager */
class CacheManager {
  public client: ReturnType<typeof createClient>;

  public subscriber: ReturnType<typeof createClient>;

  constructor() {
    const client = createClient({
      socket: {
        host: '127.0.0.1',
        port: 6379,
      },
    });

    client.on('error', err => console.log('Redis Client Error', err));

    this.client = client;
    // Subscribing to a channel requires a dedicated stand-alone connection
    this.subscriber = client.duplicate();
  }

  /** set key & value */
  async set(key: any, value: any) {
    return this.client.set(key, value);
  }

  /** get value by key */
  async get(key: any) {
    return this.client.get(key);
  }

  /** delete value by key */
  async del(key: any) {
    return this.client.del(key);
  }

  /** left push  */
  async lPush(key: any, ...elements: any) {
    return this.client.lPush(key, elements);
  }

  /** right push */
  async rPush(key: any, ...elements: any) {
    return this.client.rPush(key, elements);
  }

  /** left remove */
  async lRemove(key: any, count: number, element: any) {
    return this.client.lRem(key, count, element);
  }

  /** get list value */
  async getList(key: any): Promise<string[]> {
    return this.client.lRange(key, 0, -1);
  }

  /** 订阅 channel */
  async subscribe(channel: PubSubChannel, listener: SubListener) {
    logger.info('cacheManager subscribe channel:' + channel);
    return this.subscriber.subscribe(channel, listener);
  }

  /** 发布消息到 channel */
  async publish(channel: PubSubChannel, data: string) {
    logger.info('cacheManager publish channel:' + channel + 'data:' + data);
    return this.client.publish(channel, data);
  }

  /** 解除订阅 channel */
  async unsubscribe(channel: PubSubChannel) {
    logger.info('cacheManager unsubscribe channel:' + channel);
    return this.subscriber.unsubscribe(channel);
  }
}

/** 初始化 cache */
export const initCacheManager = async () => {
  if (!cacheManager) {
    cacheManager = new CacheManager();
    try {
      await cacheManager.client.connect();
      await cacheManager.subscriber.connect();
    } catch (error) {
      throw error;
    }
  }
  return cacheManager;
};

/**
 * getCacheManager
 * @returns cacheManager
 */
export const getCacheManager = () => {
  return cacheManager;
};
