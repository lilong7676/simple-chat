import React, { useContext, useEffect, useState } from 'react';
import { Skeleton, DotLoading } from 'antd-mobile';
import { NavigationController } from '@lilong767676/navigation-controller';
import { StateContext } from '@/store';
import { setAxiosDefaultAccesstoken, fetchProfile } from '@/api';
import Login from './login';
import { routes } from '@/routes';

/**
 * rootNavigationController 全局唯一
 */
const naviController = new NavigationController(routes);

interface LayoutProps {
  RootStateProvider: React.ComponentType<any>;
}

const Layout = (props: LayoutProps) => {
  const { RootStateProvider } = props;

  const { isLogin, accessToken } = useContext(StateContext);

  const [isValidLogin, setIsValidLogin] = useState(true);
  const [isTryLogin, setIsTryLogin] = useState(true);

  useEffect(() => {
    if (isLogin && accessToken) {
      // 判断是否是有效的token
      setAxiosDefaultAccesstoken(accessToken);
      setIsTryLogin(true);
      fetchProfile()
        .then(() => {
          setIsValidLogin(true);
          setIsTryLogin(false);
        })
        .catch(e => {
          console.error('登录失效', e);
          setIsValidLogin(false);
          setIsTryLogin(false);
        });
    }
  }, [accessToken, isLogin]);

  // 清理工作
  useEffect(() => {
    return () => {
      naviController.destroy();
    };
  }, []);

  // 进入到登录页面前，需先 clean 当前 navigationController
  useEffect(() => {
    if (!isLogin || !isValidLogin) {
      naviController.clean();
    }
  }, [isLogin, isValidLogin]);

  // 显示登录页
  if (!isLogin || !isValidLogin) {
    return <Login />;
  }
  // 显示登录中
  if (isTryLogin) {
    return (
      <div className="page-container flex-column-center">
        <div className="flex-column-center">
          <DotLoading />
          <h3>登录中</h3>
        </div>
        <div style={{ width: '100%', height: '50%' }}>
          <Skeleton.Paragraph lineCount={5} animated={true} />
        </div>
      </div>
    );
  }

  return (
    <div
      id="root-view-controller"
      ref={ele => {
        ele && naviController.setRootContainer(ele, RootStateProvider);
      }}
    />
  );
};

export default Layout;
