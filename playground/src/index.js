import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { StoreProvider } from './store/Store';
import { initialState, reducer } from './store/reducer';

import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/src/themes.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StoreProvider initialState={initialState} reducer={reducer}>
      <sp-theme scale="medium" color="dark">
        <App />
      </sp-theme>
    </StoreProvider>
  </React.StrictMode>
);
