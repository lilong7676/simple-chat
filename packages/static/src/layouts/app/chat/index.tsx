import React from 'react';
import { Button, Popover } from 'antd-mobile';
import { Action } from 'antd-mobile/es/components/popover';
import { AddCircleOutline } from 'antd-mobile-icons';
import { FriendList } from './friend-list';
import AppPage from '@/layouts/templates/app-page';
import { push, RouteNames } from '@/routes';

const Chat = () => {
  const goAddFriendsPage = () => {
    push(RouteNames.addFriendPage, null);
  };

  const actions: Action[] = [{ key: 'add', text: '添加好友' }];

  const navBarRight = (
    <Popover.Menu
      actions={actions}
      placement="bottom-start"
      onAction={node => {
        const { key } = node;
        if (key === 'add') {
          goAddFriendsPage();
        }
      }}
      trigger="click"
    >
      <Button fill="none">
        <AddCircleOutline />
      </Button>
    </Popover.Menu>
  );

  return (
    <AppPage navBarChildren="toys" navBarRight={navBarRight}>
      <FriendList />
    </AppPage>
  );
};

export default Chat;
