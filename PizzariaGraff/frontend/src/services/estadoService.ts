import { Estado, Pais } from '../types';
import api from './api';

// Dados mock para usar em caso de falha da API
const mockEstados: Estado[] = [
  {
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
  {
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
  }
];

// Adaptador para converter dados da API para o frontend
export const adaptEstadoFromApi = (apiEstado: any): Estado => {
  // Assegurar que os dados são consistentes
  const paisId = apiEstado.paisId || (apiEstado.pais && apiEstado.pais.id);
  const paisNome = apiEstado.paisNome || (apiEstado.pais && apiEstado.pais.nome);
  const paisCodigo = apiEstado.paisCodigo || (apiEstado.pais && apiEstado.pais.codigo) || '';
  const paisSigla = apiEstado.paisSigla || (apiEstado.pais && apiEstado.pais.sigla) || '';

  return {
    id: apiEstado.id,
    nome: apiEstado.nome,
    uf: apiEstado.uf,
    pais: {
      id: paisId || '',
      nome: paisNome || '',
      codigo: paisCodigo,
      sigla: paisSigla
    },
    dataCadastro: apiEstado.dataCadastro || null,
    ultimaModificacao: apiEstado.ultimaModificacao || apiEstado.dataModificacao || null
  };
};

// Adaptador para converter dados do frontend para a API
export const adaptEstadoToApi = (estado: Omit<Estado, 'id'>): any => {
  return {
    nome: estado.nome,
    uf: estado.uf,
    paisId: estado.pais.id
  };
};

// Busca todos os estados
export const getEstados = async (): Promise<Estado[]> => {
  try {
    console.log('Buscando estados da API...');
    const response = await api.get('/estados');
    console.log('Resposta da API (estados):', response.data);
    
    // Converter para formato do frontend
    const estados = Array.isArray(response.data)
      ? response.data.map(adaptEstadoFromApi)
      : [];
    
    console.log('Estados convertidos:', estados);
    return estados;
  } catch (error) {
    console.error('Erro ao buscar estados:', error);
    
    // Dados mockados para casos de falha
    return [
      {
        id: 1,
        nome: 'São Paulo',
        uf: 'SP',
        pais: {
          id: 'BRA',
          nome: 'Brasil',
          codigo: '55',
          sigla: 'BR'
        },
        dataCadastro: '2023-01-01T10:00:00',
        ultimaModificacao: '2023-01-01T10:00:00'
      }
    ];
  }
};

// Busca estado por ID
export const getEstado = async (id: number): Promise<Estado | null> => {
  try {
    console.log(`Buscando estado com ID ${id}...`);
    const response = await api.get(`/estados/${id}`);
    console.log(`Resposta da API (estado ${id}):`, response.data);
    
    return adaptEstadoFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao buscar estado com ID ${id}:`, error);
    
    // Estado mockado para testes
    if (id === 1) {
      return {
        id: 1,
        nome: 'São Paulo',
        uf: 'SP',
        pais: {
          id: 'BRA',
          nome: 'Brasil',
          codigo: '55',
          sigla: 'BR'
        },
        dataCadastro: '2023-01-01T10:00:00',
        ultimaModificacao: '2023-01-01T10:00:00'
      };
    }
    
    return null;
  }
};

// Cria novo estado
export const createEstado = async (estado: Omit<Estado, 'id'>): Promise<Estado> => {
  try {
    console.log('Criando novo estado:', estado);
    
    // Adaptar dados para API
    const estadoApiFormat = adaptEstadoToApi(estado);
    console.log('Dados formatados para API:', estadoApiFormat);
    
    const response = await api.post('/estados', estadoApiFormat);
    console.log('Estado criado com sucesso:', response.data);
    
    return adaptEstadoFromApi(response.data);
  } catch (error) {
    console.error('Erro ao criar estado:', error);
    throw error;
  }
};

// Atualiza estado existente
export const updateEstado = async (id: number, estado: Omit<Estado, 'id'>): Promise<Estado> => {
  try {
    console.log(`Atualizando estado ${id}:`, estado);
    
    // Adaptar dados para API
    const estadoApiFormat = adaptEstadoToApi(estado);
    console.log('Dados formatados para API:', estadoApiFormat);
    
    const response = await api.put(`/estados/${id}`, estadoApiFormat);
    console.log(`Estado ${id} atualizado com sucesso:`, response.data);
    
    return adaptEstadoFromApi(response.data);
  } catch (error) {
    console.error(`Erro ao atualizar estado ${id}:`, error);
    throw error;
  }
};

// Remove estado
export const deleteEstado = async (id: number): Promise<void> => {
  try {
    console.log(`Excluindo estado ${id}...`);
    await api.delete(`/estados/${id}`);
    console.log(`Estado ${id} excluído com sucesso`);
  } catch (error) {
    console.error(`Erro ao excluir estado ${id}:`, error);
    throw error;
  }
}; 