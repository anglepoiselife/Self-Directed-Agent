import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root')!);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e: any) {
  const el = document.getElementById('root');
  if (el) {
    el.innerHTML = '<pre style="color:red;padding:10px;">ERROR: ' + (e?.message || e) + '\n\nStack: ' + (e?.stack || 'N/A') + '</pre>';
  }
  console.error('App render crash:', e);
}