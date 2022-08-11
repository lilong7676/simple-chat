/*
 * 管理整个应用的状态
 * @Author: lilonglong
 * @Date: 2022-06-10 22:58:54
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-11 09:44:11
 */
import { initChatClient, ChatClient } from '@toys/chat-client-sdk';
import { UpdateIncomingFriendRequestParams } from '@toys/common/lib/types/api-params';
import { IConversation } from '@toys/common/lib/model/conversation';
import { IState, getState, watchState, updateStateManually } from '@/store';
import {
  fetchIncomingFriendRequests,
  fetchUpdateIncomingFriendRequest,
  fetchGetFriendList,
} from '@/api';

class AppManager {
  static manager: AppManager | undefined;

  private chatClient: ChatClient;

  constructor() {
    const { accessToken, user } = getState();

    // 监听 state 变化
    watchState(this.handleStateChanged);

    // init chatClient
    this.chatClient = initChatClient({
      accessToken,
      userId: user.id,
    });
    this.chatClient.on('receiveNotifyMessage', _notifyMessageList => {
      this.refresh();
    });
    this.chatClient.on(
      'refreshConversationList',
      this.handleConversationListRefreshed
    );

    // 获取联系人列表
    this.fetchGetFriendList();

    AppManager.manager = this;
  }

  private handleStateChanged = (newState: IState, oldState: IState) => {
    if (!newState.isLogin && oldState.isLogin) {
      this.onLogout();
    }
  };

  private onLogout() {
    console.log('onLogout');
    this.chatClient.destroy();
  }

  /**
   * 处理会话列表刷新后的逻辑
   */
  private handleConversationListRefreshed(conversationList: IConversation[]) {
    const messageCenterRedpoint = conversationList.reduce((pre, curr) => {
      return pre + curr.unreadCount;
    }, 0);
    const state = getState();
    if (state.redpoint.messageCenterRedpoint !== messageCenterRedpoint) {
      const newState: IState = {
        ...state,
        redpoint: {
          ...state.redpoint,
          messageCenterRedpoint,
        },
      };
      updateStateManually(newState, state);
    }
  }

  public refresh() {
    // 刷新红点信息
    this.refreshRedpoint();
    // 刷新好友列表
    this.fetchGetFriendList();
  }

  // 刷新红点
  public async refreshRedpoint() {
    // 获取待我处理的好友请求
    try {
      const { data } = await fetchIncomingFriendRequests();
      const state = getState();
      const newState: IState = {
        ...state,
        redpoint: {
          ...state.redpoint,
          incomingFriendRequestsCount: data.length,
        },
      };
      updateStateManually(newState, state);
    } catch (e) {
      console.error(e);
    }
  }

  /** 获取待我处理的好友请求 */
  public async fetchIncomingFriendRequests() {
    try {
      const { data } = await fetchIncomingFriendRequests();
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  /** 处理好友请求（同意/拒绝） */
  public async updateFriendRequest(params: UpdateIncomingFriendRequestParams) {
    const { data } = await fetchUpdateIncomingFriendRequest(params);
    this.refresh();
    return data;
  }

  /**
   * 获取好友列表
   */
  public async fetchGetFriendList() {
    try {
      const { data } = await fetchGetFriendList();
      const state = getState();
      const newState: IState = {
        ...state,
        friendList: data,
      };
      updateStateManually(newState, state);
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * 获取 AppManager 单例
 */
export const getAppManager = () => {
  if (AppManager.manager) {
    return AppManager.manager;
  }
  return new AppManager();
};

/** 初始化 AppManager 单例 */
export const initAppManager = () => {
  return getAppManager();
};
