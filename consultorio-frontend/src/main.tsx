import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ModalProvider } from './components/context/ModalProvider'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <ModalProvider> {/* 👈 Aquí lo envolvés */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ModalProvider>
  </React.StrictMode>
);
