import React, { useRef, useState, useContext, useCallback } from 'react';
import { Form, Input, Button, Divider, Toast } from 'antd-mobile';
import type { ToastHandler } from 'antd-mobile/es/components/toast';
import { fetchLogin, fetchRegister } from '@/api';
import { DispatchContext } from '@/store';
import { actionSetLoginInfo } from '@/store/actions';
import { LocalStorageKeys } from '@/constants';
import style from './index.module.less';

enum UIStatus {
  /** 登陆状态 */
  LOGIN,
  /** 注册状态 */
  REGISTER,
}

interface IProps {}

const Login: React.FC<IProps> = () => {
  const dispatch = useContext(DispatchContext);

  const [localState, setLocalState] = useState({
    status: UIStatus.LOGIN,
  });
  const { status } = localState;
  const statusDesc = status === UIStatus.LOGIN ? '登陆' : '注册';

  const toastHandler = useRef<ToastHandler>();

  const onFinish = (formValue: any) => {
    if (status === UIStatus.LOGIN) {
      tryLogin(formValue);
    } else {
      tryRegister(formValue);
    }
  };

  /** 登陆 */
  const tryLogin = useCallback(
    (formValue: any) => {
      const { username, password } = formValue;
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      params.append('grant_type', 'password');
      params.append('client_id', 'web');

      toastHandler.current = Toast.show({
        icon: 'loading',
        content: '登陆中...',
        duration: 0,
      });
      fetchLogin(params)
        .then(data => {
          const {
            data: { accessToken, user },
          } = data;

          /** 本地存储 */
          localStorage.setItem(LocalStorageKeys.accessToken, accessToken);
          localStorage.setItem(LocalStorageKeys.user, JSON.stringify(user));

          /** dispatch 登陆成功 */
          dispatch(
            actionSetLoginInfo({
              isLogin: true,
              accessToken,
              user,
            })
          );
        })
        .catch(() => {
          Toast.show('用户名密码错误');
        })
        .finally(() => {
          toastHandler.current?.close();
        });
    },
    [dispatch]
  );

  /** 注册 */
  const tryRegister = useCallback(
    (formValue: any) => {
      const { username, password, repassword } = formValue;
      if (password !== repassword) {
        Toast.show('密码不一致');
        return;
      }
      toastHandler.current = Toast.show({
        icon: 'loading',
        content: '注册中...',
        duration: 0,
      });
      const params = {
        name: username,
        password,
      };

      fetchRegister(params)
        .then(data => {
          console.log('data', data);
          setLocalState({
            ...localState,
            status: UIStatus.LOGIN,
          });
        })
        .catch(() => {
          Toast.show('未知错误');
        })
        .finally(() => {
          toastHandler.current?.close();
        });
    },
    [localState]
  );

  return (
    <div className={style.login}>
      <div className={style.header}>
        <h1>{statusDesc}</h1>
      </div>
      <Form
        className={style.main}
        name="login"
        onFinish={onFinish}
        footer={
          <Button block={true} type="submit" color="primary" size="large">
            {statusDesc}
          </Button>
        }
      >
        <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item name="password" label="密码" rules={[{ required: true }]}>
          <Input type="password" placeholder="请输入密码" />
        </Form.Item>
        {status === UIStatus.REGISTER && (
          <Form.Item
            name="repassword"
            label="确认密码"
            rules={[{ required: true }]}
          >
            <Input type="password" placeholder="确认密码" />
          </Form.Item>
        )}
      </Form>

      <div className={style.footer}>
        <Divider>或</Divider>
        <Button
          block={true}
          color="primary"
          onClick={() =>
            setLocalState(state => {
              return {
                ...state,
                status:
                  state.status === UIStatus.LOGIN
                    ? UIStatus.REGISTER
                    : UIStatus.LOGIN,
              };
            })
          }
        >
          {status === UIStatus.LOGIN ? '注册' : '去登陆'}
        </Button>
      </div>
    </div>
  );
};

export default Login;
