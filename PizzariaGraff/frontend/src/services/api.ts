import axios from 'axios';

// Configurando a base URL da API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos de timeout
});

// Interceptor para adicionar logs e tratar erros
api.interceptors.request.use(
  config => {
    console.log(`Requisição para: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('Dados da requisição:', JSON.stringify(config.data, null, 2));
    return config;
  },
  error => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  response => {
    console.log(`Resposta de ${response.config.url} recebida com sucesso (${response.status})`);
    return response;
  },
  error => {
    if (error.response) {
      // A requisição foi feita e o servidor respondeu com um status de erro
      console.error('Erro na resposta API:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase()
      });
      
      // Se for um erro 500, verificar se estamos em modo de desenvolvimento
      if (error.response.status === 500 && process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        console.warn('Erro 500 recebido em modo de desenvolvimento. Verifique se o backend está rodando ou se deveria estar usando dados mockados.');
      }
    } else if (error.request) {
      // A requisição foi feita, mas não recebeu resposta
      console.error('Sem resposta do servidor:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      });
      
      // Se estiver em modo de desenvolvimento, sugerir usar dados mockados
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        console.warn('Sem resposta do servidor em modo de desenvolvimento. Verifique se o backend está rodando ou se deveria estar usando dados mockados.');
      }
    } else {
      // Algo aconteceu na configuração da requisição que causou o erro
      console.error('Erro na configuração da requisição:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 