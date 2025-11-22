import React from 'react';
import ReactDOM from 'react-dom/client';
// --- ¡CAMBIO 1: Importar BrowserRouter! ---
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* --- ¡CAMBIO 2: Envolver App con el Router! --- */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)