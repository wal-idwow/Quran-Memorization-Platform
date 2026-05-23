/**
 * React App Entry Point with i18n Support
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import Lab from './components/Lab';
import './i18n/config';
import './components/Lab.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') || document.createElement('div')
);

root.render(
  <React.StrictMode>
    <Lab />
  </React.StrictMode>
);
