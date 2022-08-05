/*
 * reducer action 定义
 * @Author: lilonglong
 * @Date: 2022-04-27 22:59:52
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-06-07 13:18:50
 */
import { IState } from './state';

/** action type */
export enum ActionType {
  /** 设置登陆信息 */
  SET_IS_LOGIN = 'SET_IS_LOGIN',
  /** 更新整个 state */
  __UPDATE_STATE = '__UPDATE_STATE',
}

/** Dispatch action */
export interface Action {
  type: ActionType;
  payload: Partial<IState>;
}

/** action 函数定义 */
type ActionFunc<T extends Partial<IState>> = (arg: T) => Action;

/** 设置登陆信息 */
interface argSetLoginInfo {
  isLogin: IState['isLogin'];
  accessToken: IState['accessToken'];
  user: IState['user'];
}

/**
 * 设置登陆信息
 * @param arg argSetLoginInfo
 * @returns Action
 */
export const actionSetLoginInfo: ActionFunc<argSetLoginInfo> = arg => {
  return {
    type: ActionType.SET_IS_LOGIN,
    payload: arg,
  };
};

/** 更新 State */
export const actionUpdateState: ActionFunc<IState> = arg => {
  return {
    type: ActionType.__UPDATE_STATE,
    payload: arg,
  };
};
