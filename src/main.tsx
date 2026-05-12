/**
 * src/main.tsx
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './hooks/useToast';

import App from './App';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);