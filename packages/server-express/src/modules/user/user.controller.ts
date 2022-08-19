import express, { Request, Response, NextFunction, Router } from 'express';
import { UpdateIncomingFriendRequestParams } from '@lilong767676/common/lib/types/api-params';
import * as service from './user.service';

const router: Router = express.Router();

/**
 * 注册新用户
 * req.body: {createUserDto}
 */
router.post(
  '/register',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await service.createUser(req.body);
      return res.json(results);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * 获取个人信息
 */
router.get('/profile', async (req, res, next) => {
  try {
    const user = await service.getUserById(req.userId);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

/**
 * getUserByName
 * req.query: {name: string}
 */
router.get('/getUserByName', async (req, res, next) => {
  try {
    const user = await service.getUserByName(req.query.name as string);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

/**
 * searchUsersByName
 * req.query: {name: string}
 */
router.get('/searchUsers', async (req, res, next) => {
  try {
    const currUserId = req.userId;
    const users = await service.searchUsersByName(req.query.name as string);
    const filterUsers = users.filter(user => {
      return user?.id !== currUserId;
    });
    return res.json(filterUsers);
  } catch (error) {
    return next(error);
  }
});

/**
 * 添加好友
 * req.body: {userId: string}
 */
router.post('/addFriend', async (req, res, next) => {
  try {
    const { body } = req;

    const result = await service.addFriendById(req.userId, body.userId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

/**
 * 获取好友请求列表
 */
router.get('/getIncomingFriendRequests', async (req, res, next) => {
  try {
    const result = await service.getIncomingFriendRequests(req.userId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

/**
 * 同意/拒绝加好友请求
 */
router.post('/updateIncomingFriendRequest', async (req, res, next) => {
  try {
    // eslint-disable-next-line prefer-destructuring
    const body: UpdateIncomingFriendRequestParams = req.body;

    const result = await service.updateFriendRequestStatus(
      req.userId,
      body.friendId,
      body.accept
    );
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

/**
 * 获取我的好友列表
 */
router.get('/getFriendList', async (req, res, next) => {
  try {
    const result = await service.getFriendList(req.userId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

/**
 * 随机获取陌生人列表
 */
router.get('/getStrangerList', async (req, res, next) => {
  try {
    const result = await service.getRandomStrangerList(req.userId);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;
