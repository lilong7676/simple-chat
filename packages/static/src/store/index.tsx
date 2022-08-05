/*
 * 简易 redux 实现
 * @Author: lilonglong
 * @Date: 2022-06-07 22:03:05
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-03 14:04:05
 */
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { LocalStorageKeys } from '@/constants';
import { state as initialState, IState } from './state';
import { getMainReducer } from './reducer';
import { Action, actionUpdateState } from './actions';
import eventEmitter, {
  RootStateChanged,
  RootStateChangedData,
  updateStateManually,
} from './event-emitter';

let currState: IState = initialState;

const StateContext = React.createContext(initialState);
const DispatchContext = React.createContext<React.Dispatch<Action>>(() => {});

/** stateProviderId */
let stateProviderId = 0;

interface StateProviderProps extends React.PropsWithChildren<any> {
  isInitial?: boolean;
}

/** StateProvider */
const StateProvider = (props: StateProviderProps) => {
  const [stateId] = useState(++stateProviderId);

  const reducer = useMemo(() => {
    return getMainReducer(stateId);
  }, [stateId]);

  const { isInitial } = props;

  /**
   * state 的初始化逻辑
   */
  let tInitialState = getState();
  if (isInitial) {
    // 判断是否已登陆
    const accessToken = localStorage.getItem(LocalStorageKeys.accessToken);
    const userJsonStr = localStorage.getItem(LocalStorageKeys.user);
    if (userJsonStr && accessToken) {
      // TODO 直接判断为以登陆，后续再做 token 校验
      const user = JSON.parse(userJsonStr);
      tInitialState = {
        ...tInitialState,
        isLogin: true,
        accessToken,
        user,
      };
    }
  }

  const [state, dispatch] = useReducer(reducer, tInitialState);
  currState = state;

  useEffect(() => {
    const emitter = eventEmitter.subscribe(
      RootStateChanged,
      (data: RootStateChangedData) => {
        const { newState, fromStateId } = data;
        /** 如果 stateId 不同，则同步 state 到其他 Store，以此实现 Store 共享 */
        if (stateId !== fromStateId) {
          dispatch(actionUpdateState(newState));
        }
      }
    );

    return () => {
      emitter.unsubscribe();
    };
  }, [stateId, dispatch]);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        {props.children}
      </StateContext.Provider>
    </DispatchContext.Provider>
  );
};

/** getState */
const getState = () => currState;

/**
 * state 观察者
 * @param watcher
 * @returns {unwatch}
 */
type Watcher = (newState: IState, oldState: IState) => void;
const watcherList: Watcher[] = [];
let hasSubscribeRootStateChanged = false;

const watchState = (watcher: Watcher) => {
  watcherList.push(watcher);

  if (!hasSubscribeRootStateChanged) {
    hasSubscribeRootStateChanged = true;
    eventEmitter.subscribe(RootStateChanged, (data: RootStateChangedData) => {
      const { newState, oldState } = data;
      watcherList.forEach(watcherCb => {
        watcherCb(newState, oldState);
      });
    });
  }

  return () => {
    watcherList.splice(watcherList.indexOf(watcher), 1);
  };
};

export {
  StateProvider,
  DispatchContext,
  StateContext,
  getState,
  watchState,
  updateStateManually,
};

export type { IState };
