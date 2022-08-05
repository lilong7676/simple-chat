/**
 * 拦截并修改 res.json 方法
 */

import { Response, Request, NextFunction } from 'express';

const interceptor = (req: Request, res: Response, next: NextFunction) => {
  const oldJson = res.json;
  res.json = function (data) {
    res.json = oldJson;

    if (res.statusCode === 200) {
      // 正常响应，并格式化 json
      return res.json({
        code: res.statusCode,
        message: 'ok',
        data,
      });
    }
    return res.json(data);
  };
  next();
};

export default interceptor;
