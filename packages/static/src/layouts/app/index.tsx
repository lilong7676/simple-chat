import React, { useContext, useMemo, useState } from 'react';
import { useMount } from 'ahooks';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  MessageOutline,
  MessageFill,
  UserOutline,
} from 'antd-mobile-icons';
import classNames from 'classnames';
import Home from './home';
import MessageCenter from './message-center';
import PersonalCenter from './personal-center';
import { getAppManager } from '@/manager/app-manager';
import { StateContext } from '@/store';

export default function App() {
  const [activeKey, setActiveKey] = useState('home');
  const appManager = useMemo(() => getAppManager(), []);

  // onMount
  useMount(() => {
    // 刷新 app 红点
    appManager.refreshRedpoint();
  });

  const {
    redpoint: { incomingFriendRequestsCount, messageCenterRedpoint },
  } = useContext(StateContext);

  const tabs = [
    {
      key: 'home',
      title: '首页',
      icon: <AppOutline />,
      badge: incomingFriendRequestsCount || '',
    },
    {
      key: 'message-center',
      title: '消息中心',
      icon: (active: boolean) =>
        active ? <MessageFill /> : <MessageOutline />,
      badge: messageCenterRedpoint || '',
    },
    {
      key: 'personal-center',
      title: '个人中心',
      icon: <UserOutline />,
    },
  ];

  return (
    <div className="app-page">
      <div
        className={classNames('app-page-item', {
          hidden: activeKey !== 'home',
        })}
      >
        <Home />
      </div>

      <div
        className={classNames('app-page-item', {
          hidden: activeKey !== 'message-center',
        })}
      >
        <MessageCenter isActive={activeKey === 'message-center'} />
      </div>

      <div
        className={classNames('app-page-item', {
          hidden: activeKey !== 'personal-center',
        })}
      >
        <PersonalCenter />
      </div>
      <TabBar
        className="app-tab-bar"
        activeKey={activeKey}
        onChange={setActiveKey}
      >
        {tabs.map(item => (
          <TabBar.Item
            key={item.key}
            icon={item.icon}
            title={item.title}
            badge={item.badge}
          />
        ))}
      </TabBar>
    </div>
  );
}
