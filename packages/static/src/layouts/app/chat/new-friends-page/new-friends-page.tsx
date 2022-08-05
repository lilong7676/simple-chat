/*
 * 好友请求列表
 * @Author: lilonglong
 * @Date: 2022-06-16 22:32:31
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-06-16 16:22:28
 */
import React, { useRef, useCallback, useMemo } from 'react';
import { Skeleton, List, SwipeAction, Toast } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/swipe-action';
import type { ToastHandler } from 'antd-mobile/es/components/toast';
import AppPage from '@/layouts/templates/app-page';
import useFetchNewFriendRequests from '@/manager/app-manager/hooks/useFetchNewFriendRequest';
import { getAppManager } from '@/manager/app-manager';

const NewFriendsPage = () => {
  const { loading, friendRequests, refresh } = useFetchNewFriendRequests();

  const updatingToastHandler = useRef<ToastHandler>();

  const appManager = useMemo(() => {
    return getAppManager();
  }, []);

  // 同意/拒绝
  const handleFriendAction = useCallback(
    (friendId: string, accept: boolean) => {
      updatingToastHandler.current = Toast.show({
        icon: 'loading',
        content: '加载中…',
        duration: 0,
      });
      appManager
        .updateFriendRequest({
          friendId,
          accept,
        })
        .then(() => {
          updatingToastHandler.current?.close();
          Toast.show({
            icon: 'success',
            content: '已同意好友请求',
          });
          refresh();
        })
        .catch(e => {
          updatingToastHandler.current?.close();
          Toast.show({
            icon: 'fail',
            content: e.message,
          });
        });
    },
    [appManager, refresh]
  );

  // 侧滑按钮
  const rightActions: Action[] = [
    {
      key: 'reject',
      text: '拒绝',
      color: 'warning',
    },
    {
      key: 'accept',
      text: '同意',
      color: 'green',
    },
  ];

  return (
    <AppPage navBarChildren="新朋友">
      {loading && (
        <div>
          <Skeleton.Title animated />
          <Skeleton.Paragraph lineCount={5} animated />
        </div>
      )}
      {!loading && (
        <List header="好友通知">
          {friendRequests.map(item => {
            return (
              <SwipeAction
                key={item.id}
                rightActions={rightActions}
                onAction={action => {
                  handleFriendAction(item.userId, action.key === 'accept');
                }}
              >
                <List.Item key={item.id}>{item.user?.name}</List.Item>
              </SwipeAction>
            );
          })}
        </List>
      )}
    </AppPage>
  );
};

export default NewFriendsPage;
