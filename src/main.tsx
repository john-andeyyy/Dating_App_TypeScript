import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router";

import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'
import { RandomProvider } from './context/RandomListContext.jsx';
import App from './App.jsx';
import { MatchListProvider } from './context/MatchListContext.jsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
        <RandomProvider>
          <MatchListProvider>
            <App />
          </MatchListProvider>
        </RandomProvider>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
);
