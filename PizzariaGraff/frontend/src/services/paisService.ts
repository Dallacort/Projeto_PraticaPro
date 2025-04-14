import api from './api';
import { Pais } from '../types';
import { 
  getMockPaises, 
  getMockPais, 
  createMockPais, 
  updateMockPais, 
  deleteMockPais 
} from './mock/paisMock';

// Flag para forçar o uso de dados mock (utilizar para testes sem backend)
const FORCE_MOCK = false;

// Adaptador para converter dados da API para o frontend
export const adaptPaisFromApi = (apiPais: any): Pais => {
  return {
    id: apiPais.id,
    nome: apiPais.nome,
    sigla: apiPais.sigla || '',
    codigo: apiPais.codigo || '',
    dataCadastro: apiPais.dataCadastro || null,
    ultimaModificacao: apiPais.ultimaModificacao || apiPais.dataModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
export const adaptPaisToApi = (pais: Omit<Pais, 'id'>): any => {
  return {
    nome: pais.nome,
    sigla: pais.sigla,
    codigo: pais.codigo
  };
};

// Busca todos os países
export const getPaises = async (): Promise<Pais[]> => {
  if (FORCE_MOCK) {
    return getMockPaises();
  }

  try {
    console.log('Buscando países da API...');
    const response = await api.get('/paises');
    console.log('Resposta da API (paises):', response.data);
    
    // Converter para formato do frontend
    const paises = Array.isArray(response.data)
      ? response.data.map(adaptPaisFromApi)
      : [];
    
    console.log('Países convertidos:', paises);
    return paises;
  } catch (error) {
    console.error('Erro ao buscar países:', error);
    
    // Dados mockados para casos de falha
    return [
      {
        id: 'BRA',
        nome: 'Brasil',
        sigla: 'BR',
        codigo: '55',
        dataCadastro: '2023-01-01T10:00:00',
        ultimaModificacao: '2023-01-01T10:00:00'
      }
    ];
  }
};

// Busca país por ID
export const getPais = async (id: string): Promise<Pais | null> => {
  // Validar se o ID é uma string não vazia
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error(`ID de país inválido: ${id}`);
    throw new Error(`ID de país inválido: ${id}`);
  }
  
  if (FORCE_MOCK) {
    return getMockPais(id);
  }
  
  try {
    console.log(`Buscando país com ID ${id}...`);
    const response = await api.get(`/paises/${id}`);
    console.log(`Resposta da API (país ${id}):`, response.data);
    
    return adaptPaisFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar país com ID ${id}:`, error);
    
    // País mockado para testes
    if (id === 'BRA') {
      return {
        id: 'BRA',
        nome: 'Brasil',
        sigla: 'BR',
        codigo: '55',
        dataCadastro: '2023-01-01T10:00:00',
        ultimaModificacao: '2023-01-01T10:00:00'
      };
    }
    
    return null;
  }
};

// Cria novo país
export const createPais = async (pais: Omit<Pais, 'id'>): Promise<Pais> => {
  if (FORCE_MOCK) {
    return createMockPais(pais);
  }

  try {
    console.log('Criando novo país:', pais);
    
    // Adaptar dados para API
    const paisApiFormat = adaptPaisToApi(pais);
    console.log('Dados formatados para API:', paisApiFormat);
    
    const response = await api.post('/paises', paisApiFormat);
    console.log('País criado com sucesso:', response.data);
    
    return adaptPaisFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar país:', error);
    throw error;
  }
};

// Atualiza país existente
export const updatePais = async (id: string, pais: Omit<Pais, 'id'>): Promise<Pais> => {
  // Validar se o ID é uma string não vazia
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error(`ID de país inválido para atualização: ${id}`);
    throw new Error(`ID de país inválido para atualização: ${id}`);
  }
  
  if (FORCE_MOCK) {
    return updateMockPais(id, pais);
  }
  
  try {
    console.log(`Atualizando país ${id}:`, pais);
    
    // Adaptar dados para API
    const paisApiFormat = adaptPaisToApi(pais);
    console.log('Dados formatados para API:', paisApiFormat);
    
    const response = await api.put(`/paises/${id}`, paisApiFormat);
    console.log(`País ${id} atualizado com sucesso:`, response.data);
    
    return adaptPaisFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar país ${id}:`, error);
    throw error;
  }
};

// Remove país
export const deletePais = async (id: string): Promise<void> => {
  // Validar se o ID é uma string não vazia
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error(`ID de país inválido para exclusão: ${id}`);
    throw new Error(`ID de país inválido para exclusão: ${id}`);
  }
  
  if (FORCE_MOCK) {
    return deleteMockPais(id);
  }
  
  try {
    console.log(`Excluindo país ${id}...`);
    await api.delete(`/paises/${id}`);
    console.log(`País ${id} excluído com sucesso`);
  } catch (error) {
    console.error(`Erro ao excluir país ${id}:`, error);
    throw error;
  }
}; 