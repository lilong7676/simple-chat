/*
 * 路由跳转工具方法
 * @Author: lilonglong
 * @Date: 2022-05-24 22:26:44
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-03 15:38:25
 */

import React from 'react';
import { NavigationController } from '@toys/navigation-controller';
import App from '@/layouts/app';
import ChatHome from '@/layouts/app/chat';
import ChatPage from '@/layouts/app/chat/chat-page';
import AddFriendsPage from '@/layouts/app/chat/add-friends-page';
import NewFriendsPage from '@/layouts/app/chat/new-friends-page';

// 路由名字配置
export enum RouteNames {
  root = '/',
  addFriendPage = '/addFriendPage',
  newFriendsPage = '/newFriendPage',
  chatHome = '/chatHome',
  chatPage = '/chatPage',
}

// 路由名 - 页面 配置
export const routes = {
  root: App,
  [RouteNames.addFriendPage]: AddFriendsPage,
  [RouteNames.newFriendsPage]: NewFriendsPage,
  [RouteNames.chatHome]: ChatHome,
  [RouteNames.chatPage]: ChatPage,
};

/**
 * 跳转到指定页面，这里支持根据 routeName 推导出 props的类型
 * 所以请使用此方法跳转路由
 * @param routeName 路由名
 * @param props 页面属性
 */
export function push<T extends RouteNameKeys>(
  routeName: T,
  props: GetComponentProps<GetRoutePageType<T>>
) {
  NavigationController.push(routeName, props);
}

// route names 的类型
type RouteNameKeys = keyof typeof routes;

// route pages 的类型
type GetRoutePageType<T extends RouteNameKeys> = typeof routes[T];

// 根据react组件获取其 props 类型
// https://stackoverflow.com/a/50136346/11394539
type GetComponentProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  | React.FC<infer P>
  ? P
  : never;
