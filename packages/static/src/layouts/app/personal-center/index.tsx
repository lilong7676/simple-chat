/*
 * 个人中心
 * @Author: lilonglong
 * @Date: 2022-06-06 22:47:57
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-03 11:21:48
 */

import React, { useContext } from 'react';
import { Button, List } from 'antd-mobile';
import AppPage from '@/layouts/templates/app-page';
import { StateContext, DispatchContext } from '@/store';
import { state as initalState } from '@/store/state';
import { actionSetLoginInfo } from '@/store/actions';
import { LocalStorageKeys } from '@/constants';
import './index.less';

const classPrefix = 'personal-center';

const PersonalCenter = () => {
  const state = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const {
    user: { name },
  } = state;

  const handleLogoutClicked = () => {
    localStorage.setItem(LocalStorageKeys.accessToken, '');
    localStorage.setItem(LocalStorageKeys.user, '');

    dispatch(
      actionSetLoginInfo({
        ...initalState,
      })
    );
  };

  console.log('personal-center state', state);

  return (
    <AppPage navBarBackArrow={false} navBarChildren="个人中心">
      <List header="个人中心">
        <List.Item description={name}>用户名</List.Item>
      </List>

      <div className={`${classPrefix}-footer`}>
        <Button color="primary" onClick={handleLogoutClicked}>
          退出登录
        </Button>
      </div>
    </AppPage>
  );
};

export default PersonalCenter;
