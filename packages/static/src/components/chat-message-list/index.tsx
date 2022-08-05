/*
 * 聊天消息列表
 * @Author: lilonglong
 * @Date: 2022-06-30 22:42:26
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-07-05 18:18:33
 */
import React, { RefObject, useCallback, useContext } from 'react';
import { IMessage } from '@toys/common/model/message';
import ChatMessageListItem from './message-list-item';
import { StateContext } from '@/store';
import './index.less';

export interface ChatMessageListProps {
  messageList: IMessage[];
  updateScrollBottomRef: RefObject<HTMLDivElement>;
}

const ChatMessageList = (props: ChatMessageListProps) => {
  const { messageList = [], updateScrollBottomRef } = props;

  const { friendList, user } = useContext(StateContext);

  const getUser = useCallback(
    (userId: string) => {
      let findUser: any = { name: '' };
      if (userId === user.id) {
        findUser = {
          ...user,
          isSelf: true,
        };
      } else {
        findUser = friendList.find(one => one.id === userId);
      }
      return {
        ...findUser,
      };
    },
    [friendList, user]
  );

  return (
    <div className="chat-message-list">
      {messageList.map(message => (
        <ChatMessageListItem
          key={message.id}
          message={message}
          getUser={getUser}
        />
      ))}
      <div ref={updateScrollBottomRef} />
    </div>
  );
};

export default ChatMessageList;
