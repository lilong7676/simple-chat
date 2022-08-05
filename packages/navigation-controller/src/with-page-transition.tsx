/*
 * 页面转场动画 HOC
 * @Author: lilonglong
 * @Date: 2022-05-23 22:11:55
 * @Last Modified by: lilonglong
 * @Last Modified time: 2022-06-17 17:03:09
 */
import React from 'react';
import cz from 'classnames';

interface TransitionProps {
  disableTransitionIn: boolean;
  callbackWithInstance: (instance: any) => void;
  locationState: Record<string, any>;
}

interface PageTransitionClassState {}

export interface IPageCssTransition {
  animateActiveFrom_100_to_0(): Promise<void>;
  animateActiveFrom_nagetive100_to_0(): Promise<void>;
  animateHideFrom_0_to_negative100(): Promise<void>;
  animateHideFrom_0_to_100(): Promise<void>;
}

const classNames = 'app-page-motion';
const timeout = 200;

const withPageTransition = (Cmp: React.ComponentType<any>) => {
  return class PageCssTransition extends React.Component<
    TransitionProps,
    PageTransitionClassState
  > {
    disableTransitionIn = false;

    animateWrapperRef: React.RefObject<HTMLDivElement>;

    constructor(props) {
      super(props);
      const { disableTransitionIn, callbackWithInstance } = props;
      this.disableTransitionIn = !!disableTransitionIn;
      this.animateWrapperRef = React.createRef();
      callbackWithInstance(this);
    }

    componentDidMount() {
      const { disableTransitionIn } = this.props;
      if (!disableTransitionIn) {
        this.animateActiveFrom_100_to_0();
      }
    }

    /**
     * show from right to middle
     */
    public async animateActiveFrom_100_to_0(): Promise<void> {
      return new Promise(resolve => {
        this.animateWrapperRef.current?.setAttribute('class', classNames);
        this.animateWrapperRef.current?.classList.add(`${classNames}-100-0`);

        setTimeout(() => {
          this.animateWrapperRef.current?.classList.add(
            `${classNames}-100-0-active`
          );
        });

        setTimeout(() => {
          resolve();
        }, timeout);
      });
    }

    /**
     * show from left to middle
     */
    public async animateActiveFrom_nagetive100_to_0(): Promise<void> {
      return new Promise(resolve => {
        this.animateWrapperRef.current?.setAttribute('class', classNames);
        this.animateWrapperRef.current?.classList.add(
          `${classNames}-negative100-0`
        );

        setTimeout(() => {
          this.animateWrapperRef.current?.classList.add(
            `${classNames}-negative100-0-active`
          );
        });

        setTimeout(() => {
          resolve();
        }, timeout);
      });
    }

    /**
     * hide from middle to left
     */
    public async animateHideFrom_0_to_negative100(): Promise<void> {
      return new Promise(resolve => {
        this.animateWrapperRef.current?.setAttribute('class', classNames);
        this.animateWrapperRef.current?.classList.add(
          `${classNames}-0-negative100`
        );

        setTimeout(() => {
          this.animateWrapperRef.current?.classList.add(
            `${classNames}-0-negative100-active`
          );
        });
        setTimeout(() => {
          resolve();
        }, timeout);
      });
    }

    /**
     * hide from middle to right
     */
    public async animateHideFrom_0_to_100(): Promise<void> {
      return new Promise(resolve => {
        this.animateWrapperRef.current?.setAttribute('class', classNames);
        this.animateWrapperRef.current?.classList.add(`${classNames}-0-100`);

        setTimeout(() => {
          this.animateWrapperRef.current?.classList.add(
            `${classNames}-0-100-active`
          );
        });

        setTimeout(() => {
          resolve();
        }, timeout);
      });
    }

    render() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { disableTransitionIn, callbackWithInstance, locationState } =
        this.props;

      return (
        <div className={cz(classNames)} ref={this.animateWrapperRef}>
          <Cmp {...locationState} />
        </div>
      );
    }
  };
};

export default withPageTransition;
