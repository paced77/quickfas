import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthGate } from './components/auth/AuthGate.tsx';
import { configureAuthenticatedFetch } from './lib/supabase.ts';
import './index.css';

configureAuthenticatedFetch();

createRoot(document.getElementById('root')!).render(
  <AuthGate>
    <App />
  </AuthGate>
);
