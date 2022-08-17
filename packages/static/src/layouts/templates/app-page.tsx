/*
 * app-page 模板
 * @Author: lilonglong
 * @Date: 2022-05-24 22:35:01
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-08-17 15:05:35
 */
import React, { ReactNode } from 'react';
import { NavigationController } from '@lilong767676/navigation-controller';
import NavBar from '@/components/nav-bar';

interface AppPageProps {
  /** 导航栏右侧内容 */
  navBarRight?: ReactNode;
  /** 左侧内容，渲染在返回区域的右侧 */
  navBarLeft?: ReactNode;
  /** 导航栏返回区域的文字，如果为 null 的话，backArrow 也不会渲染 */
  navBarBack?: string | null;
  /** 导航栏是否显示返回区域的箭头，也可以传入 ReactNode 进行自定义 */
  navBarBackArrow?: boolean | ReactNode;
  /** 导航栏title */
  navBarChildren?: ReactNode;
  /** 点击返回按钮 */
  onClickBack?: () => void;
  /** page-content 层的 css classname */
  pageContentClassName?: string;
}

const AppPage: React.FC<AppPageProps> = props => {
  const {
    navBarBack,
    navBarBackArrow,
    navBarChildren,
    navBarLeft,
    navBarRight,
    onClickBack,
    pageContentClassName,
    children,
  } = props;

  const localOnClickBack =
    onClickBack ||
    (() => {
      NavigationController.pop();
    });

  return (
    <div className="page-container">
      <NavBar
        back={navBarBack}
        backArrow={navBarBackArrow}
        onBack={localOnClickBack}
        left={navBarLeft}
        right={navBarRight}
      >
        {navBarChildren}
      </NavBar>
      <div className="page-content-container">
        <div className={`page-content ${pageContentClassName}`}>{children}</div>
      </div>
    </div>
  );
};

export default AppPage;
