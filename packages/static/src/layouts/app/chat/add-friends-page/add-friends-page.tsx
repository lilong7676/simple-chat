import React, { useState, useEffect, useCallback } from 'react';
import { Input, Toast, List, Empty, Button } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import { UserDto } from '@toys/common/lib/model/User';
import AppPage from '@/layouts/templates/app-page';
import { fetchSearchUsers, fetchStrangerList, fetchTryAddFriend } from '@/api';
import styles from './index.module.less';

const AddFriendsPage = () => {
  const [userInput, setUserInput] = useState('');

  const [userList, setUserList] = useState<UserDto[]>([]);

  const fetchUser = useCallback(async () => {
    const searchUser = async () => {
      if (userInput) {
        return fetchSearchUsers(userInput);
      }
      return fetchStrangerList();
    };

    try {
      const { data, code, message } = await searchUser();
      if (code === 200) {
        setUserList(data);
      } else {
        Toast.show(message);
      }
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: (error as Error).message,
      });
    }
  }, [userInput]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 添加好友
  const handleUserClicked = async (user: UserDto) => {
    console.log('handleUserClicked', user);
    try {
      const { code, message } = await fetchTryAddFriend(user.id);
      if (code === 200) {
        Toast.show({
          icon: 'success',
          content: '已发送好友申请',
        });
      } else {
        Toast.show({
          icon: 'fail',
          content: message,
        });
      }
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: (error as Error).message,
      });
    }
  };

  return (
    <AppPage navBarChildren="添加好友">
      <div className={styles['search-friend-container']}>
        <Input
          className="toys-input"
          placeholder="名字/账号"
          value={userInput}
          onChange={value => setUserInput(value)}
        />
      </div>

      <div>
        {userList.length > 0 ? (
          <List>
            {userList.map(user => {
              return (
                <List.Item
                  key={user.id}
                  extra={
                    <Button fill="none" onClick={() => handleUserClicked(user)}>
                      <AddOutline />
                    </Button>
                  }
                >
                  {user.name}
                </List.Item>
              );
            })}
          </List>
        ) : (
          <Empty description="暂无用户" />
        )}
      </div>
    </AppPage>
  );
};

export default AddFriendsPage;
