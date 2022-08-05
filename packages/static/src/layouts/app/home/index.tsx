import React, { useCallback } from 'react';
import { List } from 'antd-mobile';
import { UserContactOutline, FlagOutline } from 'antd-mobile-icons';
import { push, RouteNames } from '@/routes';

const Home = () => {
  const goChatPage = useCallback(() => {
    push(RouteNames.chatHome, null);
  }, []);

  return (
    <div className="app-home">
      <List header="Home">
        <List.Item prefix={<UserContactOutline />} onClick={goChatPage}>
          好友列表
        </List.Item>
      </List>
    </div>
  );
};

export default Home;
