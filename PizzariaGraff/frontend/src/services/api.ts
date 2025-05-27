import axios from 'axios';

// Configuração do Axios para usar o proxy configurado
const api = axios.create({
  baseURL: '/api', // Vai usar o proxy configurado em setupProxy.js
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // Aumentando o timeout para 15 segundos
});

// Interceptor para log de requisições (debug)
api.interceptors.request.use(config => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Interceptor para log de respostas (debug)
api.interceptors.response.use(response => {
  console.log(`API Response from ${response.config.url}:`, response.status);
  return response;
}, error => {
  if (error.response) {
    console.error(`API Error ${error.response.status} from ${error.config.url}:`, error.response.data);
  } else if (error.request) {
    console.error('API Error: No response received', error.request);
  } else {
    console.error('API Error:', error.message);
  }
  return Promise.reject(error);
});

export default api; 