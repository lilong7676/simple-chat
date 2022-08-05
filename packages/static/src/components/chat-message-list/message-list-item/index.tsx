/*
 * 聊天消息item
 * @Author: lilonglong
 * @Date: 2022-06-30 22:42:26
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-07-05 18:19:37
 */
import React from 'react';
import cz from 'classnames';
import { IMessage } from '@toys/common/model/message';
import { UserDto } from '@toys/common/model/user';

export interface MessageUser extends UserDto {
  isSelf: boolean;
}
export interface ChatMessageListItemProps {
  message: IMessage;
  getUser: (userId: string) => MessageUser;
}

const ChatMessageListItem = (props: ChatMessageListItemProps) => {
  const { message, getUser } = props;

  const user = getUser(message.fromId);

  return (
    <div className="chat-message-list-item">
      <div className="header-content">
        <div
          className={cz('avatar', {
            'is-self': user.isSelf,
          })}
        >
          {user.name.charAt(0)}
        </div>
      </div>
      <div className="main-content">
        <div className="main-header-title">{user.name}</div>
        <p className="main-content-body">{message.content}</p>
      </div>
      <div className="footer-content">{message.createdTimeFormatted}</div>
    </div>
  );
};

export default ChatMessageListItem;
