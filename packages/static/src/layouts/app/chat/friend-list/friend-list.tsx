/*
 * 好友列表
 * @Author: lilonglong
 * @Date: 2022-05-11 22:09:00
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-07-29 16:20:46
 */
import React, { useCallback, useRef, useContext, useMemo } from 'react';
import { PullToRefresh, List, Image, SearchBar, Empty } from 'antd-mobile';
import { SearchBarRef } from 'antd-mobile/es/components/search-bar';
import { useMount } from 'ahooks';
import { UserDto } from '@toys/common/model/user';
// import { mockedUsers } from '@/constants';
import { push, RouteNames } from '@/routes';
import { StateContext } from '@/store';
import { getAppManager } from '@/manager/app-manager';
import './index.less';

const FriendList = () => {
  // store 数据源
  const {
    redpoint: { incomingFriendRequestsCount },
    friendList,
  } = useContext(StateContext);

  const searchRef = useRef<SearchBarRef>(null);

  const appManager = useMemo(() => getAppManager(), []);

  // 数据刷新逻辑
  const refresh = useCallback(async () => {
    appManager.refreshRedpoint();
    await appManager.fetchGetFriendList();
  }, [appManager]);

  // 挂载时
  useMount(() => {
    refresh();
  });

  // 跳转到 新好友页
  const goFriendRequestPage = useCallback(() => {
    push(RouteNames.newFriendsPage, null);
  }, []);

  // 跳转到 聊天页
  const goChatPage = useCallback((target: UserDto) => {
    push(RouteNames.chatPage, { targetId: target.id,  });
  }, []);

  return (
    <PullToRefresh
      onRefresh={async () => {
        await refresh();
      }}
    >
      <div className="friend-list">
        {friendList.length > 0 && (
          <SearchBar
            ref={searchRef}
            placeholder="搜索好友"
            showCancelButton
            onSearch={val => {}}
            onFocus={() => {}}
            onBlur={() => {}}
            onClear={() => {}}
            onCancel={() => {}}
          />
        )}

        {incomingFriendRequestsCount > 0 && (
          <div className="notification-list">
            <List>
              <List.Item onClick={goFriendRequestPage}>新好友请求</List.Item>
            </List>
          </div>
        )}

        {friendList.length > 0 && (
          <div className="user-list">
            <List header="好友列表">
              {friendList.map(user => (
                <List.Item
                  key={user.id}
                  prefix={
                    <Image
                      src={user.avatar}
                      style={{ borderRadius: 20 }}
                      fit="cover"
                      width={40}
                      height={40}
                    />
                  }
                  description={user.description}
                  onClick={() => {
                    goChatPage(user);
                  }}
                >
                  {user.name}
                </List.Item>
              ))}
            </List>
          </div>
        )}

        {friendList.length === 0 && (
          <div className="empty-tips">
            <Empty description="暂无好友" />
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default FriendList;
