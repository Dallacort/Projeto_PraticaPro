import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Verificar se as variáveis de ambiente estão sendo carregadas corretamente
console.log('Variáveis de ambiente:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  REACT_APP_USE_MOCK_DATA: process.env.REACT_APP_USE_MOCK_DATA,
  NODE_ENV: process.env.NODE_ENV
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
