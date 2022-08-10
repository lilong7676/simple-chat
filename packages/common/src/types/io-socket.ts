/*
 * socket.io 相关类型定义
 * @Author: lilonglong
 * @Date: 2022-04-27 22:59:52
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-10 18:00:12
 */
import { MessageDto } from '../model/message';
import { ConversationDto } from '../model/conversation';

/**
 * server发给client的event类型
 */
export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;

  /** 发送消息 */
  pushMessage: (
    message: MessageDto | MessageDto[],
    callback: (result: ClientToServerResponse) => void
  ) => void;
}

/**
 * server使用的 "client发给server的event类型"
 */
export interface ClientToServerEvents {
  messageFromClient: (
    message: MessageDto,
    callback: (result: ServerToClientResponse) => void
  ) => void;
  fetchOfflineMessages: (
    undefined,
    callback: (result: ServerToClientResponse<MessageDto[]>) => void
  ) => void;
  fetchConversations: (
    undefined,
    callback: (result: ServerToClientResponse<ConversationDto[]>) => void
  ) => void;
}

/**
 * client使用的 "client发给server的event类型"
 */
export interface LocalClientToServerEventsForClient {
  messageFromClient: (
    message: MessageDto,
    callback: (error: Error | undefined, result: ServerToClientResponse) => void
  ) => void;
  fetchOfflineMessages: (
    undefined,
    callback: (
      error: Error | undefined,
      result: ServerToClientResponse<MessageDto[]>
    ) => void
  ) => void;
  fetchConversations: (
    undefined,
    callback: (
      error: Error | undefined,
      result: ServerToClientResponse<ConversationDto[]>
    ) => void
  ) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

/**
 * 定义 socket.io 中的 SocketData，eg: socket.data.**
 */
export interface SocketData {
  accessToken: string;
  userId: string;
}

export interface ServerToClientResponse<T = any> {
  ok: number;
  message?: string;
  result?: T;
}

export interface ClientToServerResponse {
  ok: number;
  message?: string;
}
