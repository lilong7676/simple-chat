/*
 * app 初始化相关
 * @Author: lilonglong
 * @Date: 2022-04-27 22:59:52
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-10 16:38:31
 */
import 'module-alias/register';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import { initCacheManager } from './cache-manager';
import 'dotenv/config';
import { AppDataSource } from '@app/data-source';
import { authRouter } from '@modules/oauth';
import { userRouter } from '@modules/user';
import logger from '@common/utils/logger';
import morganMiddleware from '@common/middleware/morgan';
import authMiddleware from '@common/middleware/auth';
import responseJsonInterceptor from '@common/middleware/response-json-interceptor';
import { initSocket } from '../modules/socket';

// create typeorm connection
AppDataSource.initialize()
  .then(async () => {
    // init cache manager
    await initCacheManager();

    // create and setup express app
    const app = express();
    // 安全相关
    app.use(helmet());
    app.use(cors());

    // 日志
    app.use(morganMiddleware);
    app.use(responseJsonInterceptor);
    app.use(authMiddleware);
    // 只接受json req
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // register routes
    app.use('/api/auth', authRouter);
    app.use('/api/user', userRouter);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      res.status(404).send();
    });

    // catch error
    app.use(function (err: any, req, res, next) {
      console.error(err.stack);
      res.status(err.code || 500).json({
        message: err.message || err.stack,
      });
    });

    // start express server
    const server = http.createServer(app);

    // init socketio
    initSocket(server);

    server.listen(3000, () => {
      logger.info('启动成功');
    });
  })
  .catch(e => {
    console.error(e);
  });
