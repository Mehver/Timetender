import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import favicon from './assets/64.ico';
import './index.css';

const link = document.createElement('link');
link.rel = 'icon';
link.type = 'image/x-icon';
link.href = favicon;
document.head.appendChild(link);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
