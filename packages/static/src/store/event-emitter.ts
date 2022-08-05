/*
 * 简易 eventEmitter
 * @Author: lilonglong
 * @Date: 2022-06-07 22:53:10
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-03 12:03:25
 */
import { IState } from './state';

const events = {};

function simpleEventEmitter() {
  return {
    subscribe: (name, cb) => {
      (events[name] || (events[name] = [])).push(cb);
      return {
        unsubscribe: () => {
          events[name] && events[name].splice(events[name].indexOf(cb), 1);
        },
      };
    },
    emit: (name, data) => {
      (events[name] || []).forEach(fn => fn(data));
    },
  };
}

export const RootStateChanged = 'RootStateChanged';

export interface RootStateChangedData {
  fromStateId: number;
  newState: IState;
  oldState: IState;
}

const eventEmitter = simpleEventEmitter();

/** 手动更新state */
export const updateStateManually = (
  newState: IState,
  oldState: IState,
  fromStateId = -1
) => {
  eventEmitter.emit(RootStateChanged, {
    fromStateId,
    newState,
    oldState,
  } as RootStateChangedData);
};

export default eventEmitter;
