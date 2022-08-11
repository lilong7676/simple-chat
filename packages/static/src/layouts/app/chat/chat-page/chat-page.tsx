/*
 * 与某人聊天页
 * @Author: lilonglong
 * @Date: 2022-06-16 22:57:57
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-11 09:44:11
 */

import React, {
  FC,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
  useContext,
} from 'react';
import { Input, PullToRefresh } from 'antd-mobile';
import { PullStatus } from 'antd-mobile/es/components/pull-to-refresh';
import {
  getChatClient,
  ChatClientEventTypes,
  FetchHistoryMessagesOptions,
} from '@toys/chat-client-sdk';
import { IMessage } from '@toys/common/lib/model/message';
import AppPage from '@/layouts/templates/app-page';
import ChatMessageList from '@/components/chat-message-list';
import { StateContext } from '@/store';
import './style.less';

export interface ChatPageProps {
  targetId: string;
}

const statusRecord: Record<PullStatus, string> = {
  pulling: '加载历史消息',
  canRelease: '松开吧',
  refreshing: '玩命加载中...',
  complete: '好啦',
};

const ChatPage: FC<ChatPageProps> = props => {
  const { targetId } = props;

  // store state
  const { user: myUserInfo, friendList } = useContext(StateContext);

  const targetUser = friendList.find(one => one.id === targetId);
  const targetUserName = targetUser?.name;

  // chatClient
  const chatClient = useMemo(() => getChatClient(), []);

  // 输入框文本
  const [msgText, setMsgText] = useState('');
  // 消息列表
  const [messageList, setMessageList] = useState<IMessage[]>([]);
  // 用来滚动到列表底部
  const listBottomRef = useRef<HTMLDivElement>(null);
  const [needScrollBottom, setNeedScrollBottom] = useState(false);
  const scrollToBottom = () => {
    listBottomRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const handleMsgTextChange = useCallback((msg: string) => {
    setMsgText(msg);
  }, []);

  // input回车键触发事件
  const onInputEnterPress = useCallback(() => {
    setMsgText('');
    chatClient.sendTextMessage(targetId, msgText);
  }, [msgText, chatClient, targetId]);

  // 判断是否需要滚动到列表底部
  useLayoutEffect(() => {
    if (needScrollBottom) {
      scrollToBottom();
      console.log('scrollToBottom');
      setNeedScrollBottom(false);
    }
  }, [needScrollBottom]);

  // 加载历史消息
  const loadHistoryMessage = useCallback(
    async (isFirstLoad?: boolean) => {
      const options: FetchHistoryMessagesOptions = {
        targetId,
        pageSize: 20,
        from: messageList.length > 0 ? messageList[0].id : undefined,
      };
      const fetchedMessageList = await chatClient.fetchHistoryMessages(options);
      if (fetchedMessageList.length > 0) {
        const newMessageList = [...fetchedMessageList, ...messageList];
        setMessageList(newMessageList);
        if (isFirstLoad) {
          setNeedScrollBottom(true);
        }
      }
    },
    [messageList, chatClient, targetId]
  );

  // onMount
  useEffect(() => {
    // 首次进入页面，则加载一次历史消息
    if (messageList.length === 0) {
      loadHistoryMessage(true);
    }

    // 监听消息发送事件
    const onSendingMessage: ChatClientEventTypes['sendingMessage'] =
      message => {
        // 在消息列表中显示此消息
        const tempMessageList = [...messageList, message];
        setMessageList(tempMessageList);
        setNeedScrollBottom(true);
      };
    chatClient.on('sendingMessage', onSendingMessage);

    // 监听收到新消息事件
    const onReceiveMessage: ChatClientEventTypes['receiveMessage'] =
      receiveMessageList => {
        console.log('onReceiveMessage', receiveMessageList);
        const newMessageList = receiveMessageList.filter(message => {
          return (
            message.fromId === targetId && message.targetId === myUserInfo.id
          );
        });
        const tempMessageList = [...messageList, ...newMessageList];
        setMessageList(tempMessageList);
        setNeedScrollBottom(true);
      };
    chatClient.on('receiveMessage', onReceiveMessage);

    // unmount
    return () => {
      chatClient.off('sendingMessage', onSendingMessage);
      chatClient.off('receiveMessage', onReceiveMessage);

      // 页面返回时，标记会话已读状态
      chatClient.markConversationRead(
        targetId,
        messageList.length > 0
          ? messageList[messageList.length - 1].id
          : undefined
      );
    };
  }, [messageList, chatClient, loadHistoryMessage, myUserInfo.id, targetId]);

  return (
    <AppPage navBarChildren={targetUserName} pageContentClassName="chat-page">
      <div className="chat-message-list-container">
        <PullToRefresh
          onRefresh={loadHistoryMessage}
          renderText={status => {
            return <div>{statusRecord[status]}</div>;
          }}
        >
          <ChatMessageList
            messageList={messageList}
            updateScrollBottomRef={listBottomRef}
          />
        </PullToRefresh>
      </div>

      <div className="chat-input-container">
        <Input
          className="chat-input"
          placeholder="Write a message..."
          value={msgText}
          onChange={handleMsgTextChange}
          onEnterPress={onInputEnterPress}
        />
      </div>
    </AppPage>
  );
};

export default ChatPage;
