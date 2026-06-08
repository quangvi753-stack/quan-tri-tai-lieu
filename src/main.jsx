import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WorkspaceProvider } from './contexts/WorkspaceContext.jsx'

import { apiFetch } from './utils/apiFetch.js';
window.fetch = apiFetch;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WorkspaceProvider>
      <App />
    </WorkspaceProvider>
  </StrictMode>,
)

