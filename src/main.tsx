import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { SessionGate } from './lib/session';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionGate>
      <App />
    </SessionGate>
  </StrictMode>,
);
