import '@endo/eventual-send/shim.js';
import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.js';
import { AgoricStateProvider } from './service/agoric.js';

const root = createRoot(document.getElementById('root'));
root.render(
  <AgoricStateProvider>
    <App />
  </AgoricStateProvider>,
);
