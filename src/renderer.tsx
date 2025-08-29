import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import 'flowbite';

const container = document.getElementById('root');
if (!container) {
  throw new Error("Element #root not found in index.html");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);