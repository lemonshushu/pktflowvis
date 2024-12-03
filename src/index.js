import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './app/App';
import store from './app/store';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <FluentProvider theme={webLightTheme}>
    <Provider store={store}>
      <App />
    </Provider>
  </FluentProvider>
);
