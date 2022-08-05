/*
 * socketio 初始化相关
 * @Author: lilonglong
 * @Date: 2022-04-27 22:59:52
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-07-14 11:55:03
 */
import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@toys/common/types/io-socket';
import {
  getAccessToken,
  isTokenNotExpires,
} from 'src/modules/oauth/oauth.service';
import { IoManager } from './io-manager';

export function initSocket(server: Server) {
  // start socket.io
  const io = new SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: {
      // cors 配置
      origin: '*',
    },
  });

  /** 初始化 cache 订阅 */
  const ioManager = new IoManager(io);

  /**
   * 校验 token 是否有效
   * this function will be executed only once per connection
   * {https://socket.io/docs/v4/middlewares/}
   */
  io.use(async (socket, next) => {
    const socketToken = socket.handshake.auth.token;
    const token = await getAccessToken(socketToken);
    if (token && isTokenNotExpires(token)) {
      // 存下用户相关信息·
      socket.data.accessToken = token.accessToken;
      socket.data.userId = token.user.id;
      next();
    } else {
      next(new Error('token is not valid'));
    }
  });

  io.on('connection', socket => {
    console.log('a user connected', socket.data.userId);
    if (!socket.data.userId) {
      return;
    }
    ioManager.setupSocketOn(socket);
    ioManager.handleUserLogined(socket);
  });
}
