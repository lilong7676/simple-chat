import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@/layouts';
import { StateProvider } from '@/store';
import 'antd-mobile/bundle/style.css';
import './global.css';

ReactDOM.render(
  <StateProvider isInitial={true}>
    <Layout RootStateProvider={StateProvider} />
  </StateProvider>,
  document.getElementById('root')
);
