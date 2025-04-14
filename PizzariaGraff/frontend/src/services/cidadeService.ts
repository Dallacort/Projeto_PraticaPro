import api from './api';
import { Cidade, Estado } from '../types';

// Dados mock para usar em caso de falha da API
const mockCidades: Cidade[] = [
  {
    id: 1,
    nome: 'São Paulo',
    estado: {
      id: 1,
      nome: 'São Paulo',
      uf: 'SP',
      pais: {
        id: 'BRA',
        nome: 'Brasil',
        codigo: '55',
        sigla: 'BR'
      },
      dataCadastro: '2023-01-01T00:00:00',
      ultimaModificacao: '2023-01-01T00:00:00'
    },
    dataCadastro: '2023-01-01T00:00:00',
    ultimaModificacao: '2023-01-01T00:00:00'
  },
  {
    id: 2,
    nome: 'Rio de Janeiro',
    estado: {
      id: 2,
      nome: 'Rio de Janeiro',
      uf: 'RJ',
      pais: {
        id: 'BRA',
        nome: 'Brasil',
        codigo: '55',
        sigla: 'BR'
      },
      dataCadastro: '2023-01-01T00:00:00',
      ultimaModificacao: '2023-01-01T00:00:00'
    },
    dataCadastro: '2023-01-01T00:00:00',
    ultimaModificacao: '2023-01-01T00:00:00'
  }
];

// Adaptador para converter dados da API para o frontend
export const adaptCidadeFromApi = (apiCidade: any): Cidade => {
  // Assegurar que os dados são consistentes
  const estadoId = apiCidade.estadoId || (apiCidade.estado && apiCidade.estado.id);
  const estadoUf = apiCidade.estadoUf || (apiCidade.estado && apiCidade.estado.uf);
  const estadoNome = apiCidade.estadoNome || (apiCidade.estado && apiCidade.estado.nome);
  const paisId = apiCidade.paisId || (apiCidade.estado && apiCidade.estado.pais && apiCidade.estado.pais.id);
  const paisNome = apiCidade.paisNome || (apiCidade.estado && apiCidade.estado.pais && apiCidade.estado.pais.nome);

  return {
    id: apiCidade.id,
    nome: apiCidade.nome,
    estado: {
      id: estadoId || 0,
      nome: estadoNome || '',
      uf: estadoUf || '',
      pais: {
        id: paisId || '',
        nome: paisNome || '',
        codigo: '',
        sigla: ''
      }
    },
    dataCadastro: apiCidade.dataCadastro || null,
    ultimaModificacao: apiCidade.ultimaModificacao || apiCidade.dataModificacao || null
  };
};

// Adaptador para converter o formato do frontend para o formato esperado pela API
const adaptCidadeToApi = (cidade: Omit<Cidade, 'id'>): any => {
  return {
    nome: cidade.nome,
    estadoId: cidade.estado.id // A API espera estadoId diretamente
  };
};

// Busca todas as cidades
export const getCidades = async (): Promise<Cidade[]> => {
  try {
    console.log('Buscando cidades da API...');
    const response = await api.get('/cidades');
    console.log('Resposta da API (cidades):', response.data);
    
    // Converter para formato de frontend
    const cidades = Array.isArray(response.data)
      ? response.data.map(adaptCidadeFromApi)
      : [];
    
    console.log('Cidades convertidas:', cidades);
    return cidades;
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    
    // Retornar dados mockados em caso de falha
    console.log('Retornando dados mockados para cidades');
    return [
      {
        id: 1,
        nome: 'São Paulo',
        estado: {
          id: 1,
          nome: 'São Paulo',
          uf: 'SP',
          pais: {
            id: 'BRA',
            nome: 'Brasil',
            codigo: '55',
            sigla: 'BR'
          }
        },
        dataCadastro: '2023-01-01T10:00:00',
        ultimaModificacao: '2023-01-01T10:00:00'
      }
    ];
  }
};

// Busca cidade por ID
export const getCidade = async (id: number): Promise<Cidade | null> => {
  try {
    console.log(`Buscando cidade com ID ${id}...`);
    const response = await api.get(`/cidades/${id}`);
    console.log(`Resposta da API (cidade ${id}):`, response.data);
    
    return adaptCidadeFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar cidade com ID ${id}:`, error);
    
    // Retornar cidade mockada para testes
    if (id === 1) {
      return {
        id: 1,
        nome: 'São Paulo',
        estado: {
          id: 1,
          nome: 'São Paulo',
          uf: 'SP',
          pais: {
            id: 'BRA',
            nome: 'Brasil',
            codigo: '55',
            sigla: 'BR'
          }
        },
        dataCadastro: '2023-01-01T10:00:00',
        ultimaModificacao: '2023-01-01T10:00:00'
      };
    }
    
    return null;
  }
};

// Cria nova cidade
export const createCidade = async (cidade: Omit<Cidade, 'id'>): Promise<Cidade> => {
  try {
    console.log('Criando nova cidade:', cidade);
    
    // Adaptar dados para API
    const cidadeApiFormat = {
      nome: cidade.nome,
      estadoId: cidade.estado.id
    };
    
    console.log('Dados formatados para API:', cidadeApiFormat);
    const response = await api.post('/cidades', cidadeApiFormat);
    console.log('Cidade criada com sucesso:', response.data);
    
    return adaptCidadeFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar cidade:', error);
    throw error;
  }
};

// Atualiza cidade existente
export const updateCidade = async (id: number, cidade: Omit<Cidade, 'id'>): Promise<Cidade> => {
  try {
    console.log(`Atualizando cidade ${id}:`, cidade);
    
    // Adaptar dados para API
    const cidadeApiFormat = {
      nome: cidade.nome,
      estadoId: cidade.estado.id
    };
    
    console.log('Dados formatados para API:', cidadeApiFormat);
    const response = await api.put(`/cidades/${id}`, cidadeApiFormat);
    console.log(`Cidade ${id} atualizada com sucesso:`, response.data);
    
    return adaptCidadeFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar cidade ${id}:`, error);
    throw error;
  }
};

// Remove cidade
export const deleteCidade = async (id: number): Promise<void> => {
  try {
    console.log(`Excluindo cidade ${id}...`);
    await api.delete(`/cidades/${id}`);
    console.log(`Cidade ${id} excluída com sucesso`);
  } catch (error) {
    console.error(`Erro ao excluir cidade ${id}:`, error);
    throw error;
  }
}; 