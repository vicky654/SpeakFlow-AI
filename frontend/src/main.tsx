import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import API_BASE_URL from './config/api';

/* Core CSS required for Ionic components to work properly */
import { setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import './index.css';

setupIonicReact({
  mode: 'md', // Keep consistent modern android style as base
  rippleEffect: true
});

import { offlineCache } from './utils/offlineCache';

console.log(`[SpeakFlow Startup] API Base URL: ${API_BASE_URL}`);

// Initialize offline sync network listeners
offlineCache.initSyncListener();


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
