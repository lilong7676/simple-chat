/*
 * 导航控制器，参考 iOS 的实现方式
 * @Author: lilonglong
 * @Date: 2022-05-11 22:56:16
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-06-17 16:52:01
 */
import { Action, Location } from 'history';
import history from 'history/browser';
import { ComponentType, FC } from 'react';
import { ViewController } from './view-controller';

export type RouteConfig = { root: ComponentType } & Record<
  string,
  ComponentType<any> | FC<any>
>;
export class NavigationController {
  /**
   * Singleton 模式
   */
  static navigationController: NavigationController | undefined;

  static pop() {
    return NavigationController.navigationController?.pop();
  }

  static push(to: string, state?: any) {
    return NavigationController.navigationController?.push(to, state);
  }

  /**
   * 当前 navigationController 里的 viewController 页面栈
   */
  private viewControllers: ViewController[] = [];

  /**
   * rootContainer，即当前 navigationController 挂载的节点
   */
  private rootContainer?: HTMLElement;

  /**
   * rootStateProvider，实现多页面状态管理逻辑
   */
  private rootStateProvider?: ComponentType<any>;

  /**
   * 路由配置
   */
  private routeConfig: RouteConfig;

  /**
   * 仅用来判断是否是真正的Pop事件
   * https://stackoverflow.com/a/60125216/11394539
   */
  private locationKeys: string[];

  /**
   * 移除 history的监听事件
   */
  private unlistenHistory?: () => void;

  constructor(routeConfig: RouteConfig) {
    this.routeConfig = routeConfig;
    this.locationKeys = ['default'];

    if (NavigationController.navigationController) {
      // 为了防止开发模式下热更新报错，这里仅在 生产模式 提示错误
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('暂不支持多个 navigationController');
      }
    }
    // 缓存单例
    NavigationController.navigationController = this;
  }

  /**
   * 设置 rootContainer，没有 rootContainer,则无法渲染页面
   */
  setRootContainer(
    container: HTMLElement,
    rootStateProvider?: ComponentType<any>
  ) {
    if (container === this.rootContainer) return;

    this.clean();
    this.rootContainer = container;
    this.rootStateProvider = rootStateProvider;
    this.setupHistory();

    // 如果当前没有 rootViewController，则根据 routeConfig 渲染 rootViewcontroller
    if (!this.getCurrentViewController()) {
      const rootViewController = new ViewController(this.routeConfig.root);
      if (!rootViewController) {
        throw new Error('rootViewController not found');
      }
      rootViewController.isRootViewController = true;
      rootViewController.key = 'default';
      rootViewController.name = 'root';
      this.pushViewController(rootViewController);
    }
  }

  /**
   * 设置 history 监听相关
   */
  private setupHistory() {
    this.unlistenHistory = history.listen(({ location, action }) => {
      this.renderByHistoryChanged(location, action);
    });
  }

  private renderByHistoryChanged(location: Location, action: Action) {
    if (!this.routeConfig) {
      console.error('no routeConfig');
      return;
    }

    let targetViewController: ViewController | undefined;

    const { pathname, key } = location;
    if (action === Action.Pop) {
      /**
       * 由于 点击浏览器的前进按钮 和 后退按钮都触发 Pop 操作，
       * 因此需要额外逻辑判断到底是真正的 Pop 还是 forward
       * https://stackoverflow.com/a/60125216/11394539
       */
      if (this.locationKeys[1] === key) {
        this.locationKeys.splice(0, 1);
        // 暂时不支持前进事件
        console.log('暂时不支持前进事件');
      } else {
        this.locationKeys.splice(0, 0, key);
        // Handle back event
        this.popViewController();
      }
      return;
    }

    if (action === Action.Push) {
      const targetPage = this.routeConfig[pathname];
      if (!targetPage) {
        console.error('route target not found');
        return;
      }
      targetViewController = new ViewController(targetPage);
      targetViewController.key = key;
      targetViewController.name = pathname;
      this.locationKeys = [key];
    } else {
      console.error(`暂不支持 ${action} 跳转方式`);
    }

    if (targetViewController) {
      this.pushViewController(targetViewController);
    }
  }

  /**
   * 推入 viewControlers 栈
   * @param viewController
   */
  private pushViewController(viewController: ViewController) {
    const lastViewController = this.getCurrentViewController();
    this.viewControllers.push(viewController);
    lastViewController?.animateHideAfterOtherVCPushed();

    const currVc = viewController;
    const newContaienr = document.createElement('div');
    newContaienr.classList.add('viewcontroller-container', 'app-page');
    newContaienr.style.zIndex = `${this.viewControllers.length}`;

    this.rootContainer?.appendChild(newContaienr);
    currVc?.render(newContaienr, this.rootStateProvider);
  }

  /**
   * 弹出 viewController 栈
   */
  private popViewController() {
    if (this.viewControllers.length > 1) {
      // 当前 vc 出栈
      const vc = this.viewControllers.pop();
      // 动画结束后，销毁该 vc
      vc?.animateExitAfterPoped().then(() => {
        vc?.destroy();
      });

      // 转场显示当前栈顶 vc
      const currVc = this.getCurrentViewController();
      currVc?.animateActiveAfterOtherVCPoped();
    } else {
      console.error('navigationController - cannot popViewController');
    }
  }

  /**
   * 获取当前栈顶 viewController
   * @returns {ViewController} viewController
   */
  private getCurrentViewController() {
    return this.viewControllers.length
      ? this.viewControllers[this.viewControllers.length - 1]
      : undefined;
  }

  public push(to: string, state?: Record<string, any>) {
    history.push(to, state);
  }

  public pop() {
    return history.back();
  }

  /**
   * 清除当前状态
   */
  public clean() {
    this.unlistenHistory && this.unlistenHistory();
    this.viewControllers.forEach(vc => vc.destroy());
    this.viewControllers.splice(0, this.viewControllers.length);
    this.rootContainer = undefined;
  }

  /**
   * 销毁逻辑
   */
  public destroy() {
    this.clean();
    NavigationController.navigationController = undefined;
  }
}
