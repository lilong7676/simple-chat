import { Request, Response, NextFunction } from 'express';
import OAuth2Server from 'oauth2-server';
import authServer from '@modules/oauth/oauth-server';

/**
 * auth 白名单，不需要校验 token
 */
const whiteList = ['/api/auth/login', '/api/user/register'];

const Auth = async (req: Request, res: Response, next: NextFunction) => {
  if (whiteList.includes(req.path)) {
    return next();
  }

  const authReq = new OAuth2Server.Request(req);
  const authRes = new OAuth2Server.Response(res);
  try {
    const token = await authServer.authenticate(authReq, authRes);
    req.userId = token.user.id;
    if (token) {
      return next();
    }
  } catch (error) {
    res.status(401).json(error);
  }
  return undefined;
};

export default Auth;
