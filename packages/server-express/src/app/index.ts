/*
 * app 初始化相关
 * @Author: lilonglong
 * @Date: 2022-04-27 22:59:52
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-19 12:06:12
 */
import express from 'express';
import path from 'path';
import http from 'http';
import bodyParser from 'body-parser';
import uaParser from 'ua-parser-js';
import helmet from 'helmet';
import cors from 'cors';
import { AppDataSource } from '@app/data-source';
import { authRouter } from '@modules/oauth';
import { userRouter } from '@modules/user';
import logger from '@common/utils/logger';
import morganMiddleware from '@common/middleware/morgan';
import authMiddleware from '@common/middleware/auth';
import responseJsonInterceptor from '@common/middleware/response-json-interceptor';
import { initCacheManager } from './cache-manager';
import { initSocket } from '../modules/socket';

// create typeorm connection
AppDataSource.initialize()
  .then(async () => {
    // init cache manager
    await initCacheManager();

    // create and setup express app
    const app = express();

    // TODO 优化点：使用配置文件，不要写死
    app.set('views', [
      path.resolve(__dirname, '../../../static/dist'),
      path.resolve(__dirname, '../views'),
    ]);
    app.set('view engine', 'ejs');
    app.get('/app', (req, res) => {
      const ua = uaParser(req.headers['user-agent']);
      const deviceType = ua.device.type === 'mobile' ? 'mobile' : 'pc';

      const reqUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const reqUrlObj = new URL(reqUrl);

      // 由于目前页面只适配了移动端的，所以非移动端访问的话，暂时返回一个由iframe包裹的页面
      if (deviceType === 'mobile' || reqUrlObj.searchParams.has('mobile')) {
        res.render('index', {
          title: 'simple-chat',
        });
      } else {
        reqUrlObj.searchParams.append('mobile', '1');
        res.render('pc', {
          title: 'simple-chat',
          iframeSrc: reqUrlObj.toString(),
        });
      }
    });

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
    app.use((_req, res, _next) => {
      res.status(404).send();
    });

    // catch error
    app.use((err: any, _req, res, _next) => {
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
