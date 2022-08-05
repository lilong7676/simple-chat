import express, { Router } from 'express';
import OAuth2Server from 'oauth2-server';
import oauth from './oauth-server';

const router: Router = express.Router();

router.post('/login', async (req, res, next) => {
  const request = new OAuth2Server.Request(req);
  const response = new OAuth2Server.Response(res);

  try {
    const token = await oauth.token(request, response);
    res.status(200).json(token);
  } catch (error: any) {
    next({ code: 401, message: error.message });
  }
});

export default router;
