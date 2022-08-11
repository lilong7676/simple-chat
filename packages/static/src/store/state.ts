import { UserDto } from '@lilong767676/common/lib/model/user';

/**
 * state
 */
export interface IState {
  isLogin: boolean;
  accessToken: string;
  /**
   * 当前用户信息
   */
  user: UserDto;
  /**
   * 好友列表
   */
  friendList: UserDto[];
  /**
   * 应用红点信息
   */
  redpoint: Redpoint;
}

/**
 * 未读红点信息
 */
interface Redpoint {
  incomingFriendRequestsCount: number;
  messageCenterRedpoint: number;
}

/** state */
const state: IState = {
  isLogin: false,
  accessToken: '',
  user: {
    id: '',
    name: '',
    isActive: false,
    created: new Date(),
    updated: new Date(),
    deleted: new Date(),
  },
  friendList: [],
  redpoint: {
    incomingFriendRequestsCount: 0,
    messageCenterRedpoint: 0,
  },
};

export { state };
