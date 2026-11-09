import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthGate } from './components/auth/AuthGate.tsx';
import { configureAuthenticatedFetch } from './lib/supabase.ts';
import './index.css';

// Intercept benign Vite dev HMR WebSocket disconnection errors in preview environments
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || (typeof event?.reason === 'string' ? event.reason : '');
    if (msg.includes('WebSocket') || msg.includes('vite') || event?.reason?.name === 'WebSocketError') {
      event.preventDefault();
    }
  });
}

configureAuthenticatedFetch();

createRoot(document.getElementById('root')!).render(
  <AuthGate>
    <App />
  </AuthGate>
);
