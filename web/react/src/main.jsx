import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../shared/hocuspocus.css'; // the look shared by every web version
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
