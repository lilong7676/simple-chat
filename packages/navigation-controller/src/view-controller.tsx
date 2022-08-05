/*
 * 页面控制器
 * @Author: lilonglong
 * @Date: 2022-05-11 22:13:19
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-06-10 13:46:04
 */
import React, { ComponentType } from 'react';
import ReactDom from 'react-dom';
import history from 'history/browser';
import withPageTransition, { IPageCssTransition } from './with-page-transition';

export class ViewController {
  /**
   * 用于调试
   */
  public name: string | undefined;

  /**
   * 是否是 rootViewController
   */
  public isRootViewController: boolean;

  /**
   * key，来自于 history.location.key
   */
  public key: string;

  /**
   * 当前 ViewController 对应的 页面组件
   */
  private cmp: ComponentType<any> | null;

  /**
   * 页面组件的 dom 挂载点
   */
  private container: HTMLElement | null;

  /**
   * 缓存当前 pageInstance
   */
  private pageInstance: IPageCssTransition;

  constructor(cmp: ComponentType<any>) {
    this.cmp = cmp;
  }

  public render(
    container: HTMLElement,
    RootStateProvider?: ComponentType<any>
  ) {
    this.container = container;
    const Cmp = this.cmp;
    if (!Cmp) return;

    // 增加转场动画效果 hoc
    const PageTransition = withPageTransition(Cmp);
    // rootViewController 不需要在刚显示时展示转场动画
    const disableTransitionIn = this.isRootViewController;
    // 传递路由参数
    const locationState = history.location.state ? history.location.state : {};

    if (RootStateProvider) {
      ReactDom.render(
        <RootStateProvider>
          <PageTransition
            disableTransitionIn={disableTransitionIn}
            callbackWithInstance={instance => {
              this.pageInstance = instance;
            }}
            locationState={{ ...locationState }}
          />
        </RootStateProvider>,
        container
      );
    } else {
      ReactDom.render(
        <PageTransition
          disableTransitionIn={disableTransitionIn}
          callbackWithInstance={instance => {
            this.pageInstance = instance;
          }}
          locationState={{ ...locationState }}
        />,
        container
      );
    }
  }

  public async animateHideAfterOtherVCPushed() {
    return this.pageInstance?.animateHideFrom_0_to_negative100();
  }

  public async animateExitAfterPoped() {
    return this.pageInstance?.animateHideFrom_0_to_100();
  }

  public async animateActiveAfterOtherVCPoped() {
    return this.pageInstance?.animateActiveFrom_nagetive100_to_0();
  }

  public destroy() {
    this.cmp = null;
    if (this.container) {
      ReactDom.unmountComponentAtNode(this.container);
    }
    this.container?.parentElement?.removeChild(this.container);
    this.container = null;
    console.log('view-controller destroyed name: ', this.name);
  }
}
