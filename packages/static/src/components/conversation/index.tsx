/*
 * 聊天会话相关
 * @Author: lilonglong
 * @Date: 2022-06-06 22:43:33
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-11 18:31:16
 */
import React from 'react';
import { Avatar, Badge } from 'antd-mobile';
import { IConversation } from '@lilong767676/common/lib/model/conversation';
import { UserDto } from '@lilong767676/common/lib/model/user';
import './index.less';

const classPrefix = 'conversation-item';

export interface ConversationItemProps {
  conversation: IConversation;
  getUser: (userId: string) => Partial<UserDto>;
  disableClickable?: boolean;
  onClick?: React.MouseEventHandler;
}

export const ConversationItem = (props: ConversationItemProps) => {
  const { disableClickable, conversation, getUser, onClick } = props;
  const { targetId, lastMessage, unreadCount } = conversation;
  const targetUser = getUser(targetId);

  const content = (
    <>
      <div className={`${classPrefix}-left-content`}>
        <div className={`${classPrefix}-user-avatar`}>
          <Avatar src="" />
        </div>
        {!!unreadCount && (
          <div className={`${classPrefix}-badge`}>
            <Badge content={unreadCount} />
          </div>
        )}
      </div>
      <div className={`${classPrefix}-main-content`}>
        <div className={`${classPrefix}-main-title`}>{targetUser.name}</div>
        <div className={`${classPrefix}-main-desc`}>{lastMessage?.content}</div>
      </div>
    </>
  );

  return React.createElement(
    disableClickable ? 'div' : 'a',
    {
      className: `${classPrefix}`,
      onClick,
    },
    content
  );
};
