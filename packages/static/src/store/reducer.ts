/*
 * reducer 定义
 * @Author: lilonglong
 * @Date: 2022-04-27 22:59:52
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-03 12:02:47
 */
import { IState } from './state';
import { ActionType, Action } from './actions';
import { updateStateManually } from './event-emitter';

/** main */
export function mainReducer(state: IState, action: Action): IState {
  console.log('action', action);
  switch (action.type) {
    case ActionType.SET_IS_LOGIN:
      return {
        ...state,
        ...action.payload,
      };
    case ActionType.__UPDATE_STATE:
      return {
        ...state,
        ...action.payload,
      };
    default: {
      throw new Error('no reducer action');
    }
  }
}

export function getMainReducer(stateId: number) {
  return function (state: IState, action: Action): IState {
    const newState = mainReducer(state, action);

    if (action.type !== ActionType.__UPDATE_STATE) {
      // 如果是非UPDATE_STATE的情况下，则通知其他 StateProvider 更新 newState
      setTimeout(() => {
        updateStateManually(newState, state, stateId);
      }, 0);
    }

    return newState;
  };
}
