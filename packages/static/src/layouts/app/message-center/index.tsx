/*
 * 消息中心
 * @Author: lilonglong
 * @Date: 2022-06-06 22:38:58
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-01 16:36:23
 */
import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
  useCallback,
} from 'react';
import { getChatClient } from '@toys/chat-client-sdk';
import { IConversation } from '@toys/common/model/conversation';
import AppPage from '@/layouts/templates/app-page';
import { ConversationItem } from '@/components/conversation';
import { StateContext } from '@/store';
import { push, RouteNames } from '@/routes';

export interface MessageCenterProps {
  isActive: boolean;
}

const MessageCenter = (props: MessageCenterProps) => {
  const { isActive } = props;

  // chatClient
  const chatClient = useMemo(() => getChatClient(), []);

  const [conversationList, setConversationList] = useState<IConversation[]>([]);

  const state = useContext(StateContext);

  useEffect(() => {
    /** 监听会话列表刷新事件 */
    const handleRefreshConversationList = convList => {
      setConversationList(convList);
    };
    chatClient.on('refreshConversationList', handleRefreshConversationList);

    return () => {
      chatClient.off('refreshConversationList', handleRefreshConversationList);
    };
  }, [chatClient, isActive]);

  const getUser = useCallback(
    (userId: string) => {
      return (
        state.friendList.find(one => one.id === userId) || { name: 'unkonwn' }
      );
    },
    [state]
  );

  const goToChatPage = useCallback(
    (conv: IConversation) => {
      push(RouteNames.chatPage, { targetId: conv.targetId });
      chatClient.markConversationRead(conv);
    },
    [chatClient]
  );

  return (
    <AppPage navBarChildren="消息中心" navBarBackArrow={false}>
      <div>
        {conversationList.map(conversation => {
          return (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              getUser={getUser}
              onClick={() => {
                goToChatPage(conversation);
              }}
            />
          );
        })}
      </div>
    </AppPage>
  );
};

export default MessageCenter;
