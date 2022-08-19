import axios from 'axios';
import { URLSearchParams } from 'url';
import { UserDto, CreateUserDto } from '@lilong767676/common/lib/model/user';
import { UpdateIncomingFriendRequestParams } from '@lilong767676/common/lib/types/api-params';
import { FriendRelationItem } from '@lilong767676/common/lib/entity/im/Friend';
import { ApiResult } from '@/typings';

if (
  process.env.NODE_ENV === 'production' &&
  !location.host.includes('localhost')
) {
  axios.defaults.baseURL = 'http://119.91.47.174';
} else {
  axios.defaults.baseURL = 'http://localhost:3000';
}
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;

/**
 * 设置 axios 默认携带 token
 */
export const setAxiosDefaultAccesstoken = (accessToken: string) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
};

export const fetchLogin = (params: URLSearchParams) => {
  return axios.post('api/auth/login', params).then(res => res.data);
};

export const fetchRegister = (params: CreateUserDto) => {
  return axios.post('api/user/register', params).then(res => res.data);
};

/**
 * 获取个人信息
 */
export const fetchProfile = () => {
  return axios
    .get<ApiResult<UserDto>>('api/user/profile')
    .then(res => res.data);
};

/**
 * 根据名字搜索用户列表
 * @returns {UserDto[]}
 */
export const fetchSearchUsers = (userName: string) => {
  return axios
    .get<ApiResult<UserDto[]>>('api/user/searchUsers', {
      params: { name: userName },
    })
    .then(res => res.data);
};

/**
 * 获取陌生人列表
 * @returns {UserDto[]}
 */
export const fetchStrangerList = () => {
  return axios
    .get<ApiResult<UserDto[]>>('api/user/getStrangerList')
    .then(res => res.data);
};

/**
 * 添加好友
 * @param userId 要添加的用户id
 * @returns {number}
 */
export const fetchTryAddFriend = (userId: string) => {
  return axios
    .post<ApiResult<number>>('api/user/addFriend', { userId })
    .then(res => res.data);
};

/**
 * 获取待处理的好友请求列表
 * @returns 待处理的好友请求列表
 */
export const fetchIncomingFriendRequests = () => {
  return axios
    .get<ApiResult<FriendRelationItem[]>>('api/user/getIncomingFriendRequests')
    .then(res => res.data);
};

/**
 * 同意/拒绝好友请求
 * @param params
 * @returns number
 */
export const fetchUpdateIncomingFriendRequest = (
  params: UpdateIncomingFriendRequestParams
) => {
  return axios
    .post<ApiResult<number>>('api/user/updateIncomingFriendRequest', params)
    .then(res => res.data);
};

/**
 * 获取好友列表
 * @returns 好友列表
 */
export const fetchGetFriendList = () => {
  return axios
    .get<ApiResult<UserDto[]>>('api/user/getFriendList')
    .then(res => res.data);
};
