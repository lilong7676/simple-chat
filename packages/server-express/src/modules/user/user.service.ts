import { Like, Not, In } from 'typeorm';
import { AppDataSource } from '@app/data-source';
import { User } from '@toys/common/lib/entity/User';
import {
  PubSubChannel,
  PubSubRequestFriendData,
  PubSubUpdateFriendRequestStatusData,
} from '@toys/common/lib/types/cache-pubsub-data';
import { Friend, FriendReqStatus } from '@toys/common/lib/entity/im/Friend';
import { CreateUserDto } from '@toys/common/lib/model/User';
import { getCacheManager } from '@app/cache-manager';

/** 过滤掉用户敏感信息 */
const filterUser = (user: User | null) => {
  if (!user) {
    return user;
  }
  const { password, ...tUser } = user;
  return tUser as User;
};

// 用户表
const userRepository = AppDataSource.getRepository(User);
// 好友表
const friendRepository = AppDataSource.getRepository(Friend);

/**
 * getUsers
 * @returns User[]
 */
export const getUsers = async () => {
  const users = await userRepository.find();
  return users.map(filterUser);
};

/**
 * 根据id get user
 * @param userId
 * @returns User
 */
export const getUserById = async (userId: string) => {
  const user = await userRepository.findOne({
    where: {
      id: userId,
    },
  });
  return filterUser(user);
};

/**
 * 创建 User
 * @param params UserLike
 * @returns User[]
 */
export const createUser = async (createUserDto: CreateUserDto) => {
  if (!createUserDto.name || String(createUserDto.name).trim().length === 0) {
    throw new Error('用户名不能为空');
  }
  if (
    !createUserDto.password ||
    String(createUserDto.password).trim().length === 0
  ) {
    throw new Error('密码不能为空');
  }

  const userExist = await userRepository.findOne({
    where: [
      {
        name: createUserDto.name,
      },
      {
        phone: createUserDto.phone || undefined,
      },
      {
        email: createUserDto.email || undefined,
      },
    ],
  });
  if (userExist) {
    throw { message: '用户名或其他信息已被使用' };
  }

  const user = new User();
  user.name = createUserDto.name;
  user.password = createUserDto.password;
  user.email = createUserDto.email || '';
  user.phone = createUserDto.phone || '';

  try {
    const results = await userRepository.save(user);
    return results;
  } catch (e) {
    throw new Error('数据库错误');
  }
};

/**
 * 根据name get user
 * @param userName
 * @returns User
 */
export const getUserByName = async (userName: string): Promise<User | null> => {
  if (!userName) {
    return null;
  }
  const user = await userRepository.findOne({
    where: {
      name: userName,
    },
  });
  return filterUser(user);
};

/**
 * 根据name 模糊搜索 user
 * @param userName
 * @returns User
 */
export const searchUsersByName = async (
  userName: string
): Promise<(User | null)[]> => {
  if (!userName) {
    return [];
  }
  const users = await userRepository.findBy({
    name: Like(`%${userName}%`),
  });
  return users.map(filterUser);
};

/** 添加好友
 * @param userId
 * @param friendId
 */
export const addFriendById = async (userId: string, friendId: string) => {
  if (!userId || !friendId) {
    throw new Error('no userId or friendId');
  }

  // 发布通知到 redis
  const notifyToRedis = () => {
    const data: PubSubRequestFriendData = {
      userId,
      friendId,
    };
    getCacheManager()?.publish(
      PubSubChannel.onRequestAddFriend,
      JSON.stringify(data)
    );
  };

  // 存储到数据库
  let friendItem = await friendRepository.findOne({
    where: {
      userId,
      friendId,
    },
  });
  if (!friendItem) {
    friendItem = new Friend();
    friendItem.userId = userId;
    friendItem.friendId = friendId;
  }
  if (friendItem.reqStatus !== FriendReqStatus.ACCEPTED) {
    friendItem.reqStatus = FriendReqStatus.PENDING;
    await friendRepository.save(friendItem);
    notifyToRedis();
    return 1;
  }
  return 0;
};

/**
 * 获取用户的好友请求列表
 * @param userId 用户 id
 */
export const getIncomingFriendRequests = async (userId: string) => {
  const friendList = await friendRepository.find({
    where: {
      friendId: userId,
      reqStatus: FriendReqStatus.PENDING,
    },
    relations: {
      friend: true,
      user: true,
    },
  });
  return friendList;
};

/**
 * 更新好友请求信息
 * @param selfUserId 当前用户 id
 * @param acceptUserId 好友 id
 * @param accept 是否同意
 * @returns
 */
export const updateFriendRequestStatus = async (
  selfUserId: string,
  acceptUserId: string,
  accept: boolean
) => {
  // 通知 redis
  const notifyToRedis = () => {
    const data: PubSubUpdateFriendRequestStatusData = {
      userId: selfUserId,
      friendId: acceptUserId,
      reqStatus: accept ? FriendReqStatus.ACCEPTED : FriendReqStatus.REJECTED,
    };
    getCacheManager()?.publish(
      PubSubChannel.onUpdateFriendRequestStatus,
      JSON.stringify(data)
    );
  };

  // 更新好友 status
  const friendReq = await friendRepository.update(
    {
      userId: acceptUserId,
      friendId: selfUserId,
    },
    {
      reqStatus: accept ? FriendReqStatus.ACCEPTED : FriendReqStatus.REJECTED,
    }
  );
  // 更新双向好友 status
  let existFriend = await friendRepository.findOne({
    where: {
      userId: selfUserId,
      friendId: acceptUserId,
    },
  });
  if (!existFriend) {
    existFriend = new Friend();
    existFriend.userId = selfUserId;
    existFriend.friendId = acceptUserId;
  }
  existFriend.reqStatus = accept
    ? FriendReqStatus.ACCEPTED
    : FriendReqStatus.REJECTED;
  await friendRepository.save(existFriend);

  //
  notifyToRedis();

  return friendReq.affected;
};

/**
 * 获取用户好友列表
 * @param userId 当前用户 id
 * @returns 好友列表
 */
export const getFriendList = async (userId: string) => {
  const friendList = await friendRepository.find({
    where: {
      userId,
      reqStatus: FriendReqStatus.ACCEPTED,
    },
  });
  const firendIdList = friendList.map(friend => friend.friendId);
  const result = await userRepository.findBy({
    id: In(firendIdList),
  });
  return result;
};

/**
 * 随机获取陌生人列表
 */
export const getRandomStrangerList = async (userId: string) => {
  const friendList = await getFriendList(userId);
  const friendIdList = friendList.map(friend => friend.id);
  // 排除自己
  friendIdList.push(userId);

  const strangerList = await userRepository.findBy({
    id: Not(In(friendIdList)),
  });
  return strangerList.map(filterUser);
};
