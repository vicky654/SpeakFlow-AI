import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import API_BASE_URL from './config/api';
import './index.css';

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
