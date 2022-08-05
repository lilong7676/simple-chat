import React from 'react';
import { NavBar } from 'antd-mobile';
import type { NavBarProps } from 'antd-mobile/es/components/nav-bar';
import './index.less';

const MyNavBar: React.FC<NavBarProps> = props => {
  return <NavBar className="toys-nav-bar" {...props} />;
};

export default MyNavBar;
